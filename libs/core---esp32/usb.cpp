#include "pxt.h"
#include "esp_log.h"
#if PXT_USB
#include "tinyusb.h"
#include "tusb_cdc_acm.h"
#include "uf2hid.h"
#endif

#define LOG(msg, ...) DMESG("USB: " msg, ##__VA_ARGS__)
#define LOGV(msg, ...) ((void)0)
#define ERROR(msg, ...) DMESG("USB-ERROR: " msg, ##__VA_ARGS__)

#if !PXT_USB

extern "C" void usb_init() {}

#else

// 260 bytes needed for biggest JD packets (with overheads)
#define HF2_BUF_SIZE 260

typedef struct {
    uint16_t size;
    uint8_t serial;
    union {
        uint8_t buf[HF2_BUF_SIZE];
        uint32_t buf32[HF2_BUF_SIZE / 4];
        uint16_t buf16[HF2_BUF_SIZE / 2];
        HF2_Command cmd;
        HF2_Response resp;
    };
} HF2_Buffer;

class HF2 {
    bool gotSomePacket;
    // uint32_t lastExchange;

  public:
    bool connected;
    HF2_Buffer pkt;

    int sendResponse(int size);
    void recv(uint8_t buf[64]);
    int sendResponseWithData(const void *data, int size);
    int sendEvent(uint32_t evId, const void *data, int size);
    void sendBuffer(uint8_t flag, const void *data, unsigned size, uint32_t prepend = -1);
    int handlePkt(int sz);
    int sendSerial(const void *data, int size, int isError = 0);

    HF2() {}
};

static HF2 hf2;

static const char *descriptor_str[USB_STRING_DESCRIPTOR_ARRAY_SIZE] = {
    // array of pointer to string descriptors
    (char[]){0x09, 0x04},                // 0: is supported language is English (0x0409)
    CONFIG_USB_DESC_MANUFACTURER_STRING, // 1: Manufacturer
    "PXT Device (app)",                  // 2: Product
    "",                                  // 3: Serials -> replaced

#if CONFIG_USB_CDC_ENABLED
    CONFIG_USB_DESC_CDC_STRING,          // 4: CDC Interface
#else
    "",
#endif

#if CONFIG_USB_MSC_ENABLED
    CONFIG_USB_DESC_MSC_STRING,          // 5: MSC Interface
#else
    "",
#endif

#if CONFIG_USB_HID_ENABLED
    CONFIG_USB_DESC_HID_STRING           // 6: HIDs
#else
    "",
#endif
};

static void on_cdc_rx(int itf0, cdcacm_event_t *event) {
    /* initialization */
    uint8_t buf[CONFIG_USB_CDC_RX_BUFSIZE];
    size_t rx_size = 0;
    tinyusb_cdcacm_itf_t itf = (tinyusb_cdcacm_itf_t)itf0;

    /* read */
    esp_err_t ret = tinyusb_cdcacm_read(itf, buf, CONFIG_USB_CDC_RX_BUFSIZE, &rx_size);
    if (ret == ESP_OK) {
        LOGV("%d (%d)", rx_size, buf[0]);
        hf2.recv(buf);
    } else {
        ERROR("Read error");
    }
}

static void on_cdc_line_state_changed(int itf, cdcacm_event_t *event) {
    hf2.connected = event->line_state_changed_data.dtr && event->line_state_changed_data.rts;
    LOG("connected: %d", hf2.connected);
}

extern "C" void usb_init() {
    LOG("init");
    tinyusb_config_t tusb_cfg;
    memset(&tusb_cfg, 0, sizeof(tusb_cfg));

    uint8_t mac[6];
    esp_efuse_mac_get_default(mac);
    static char macHex[15];
    macHex[0] = 'P';
    macHex[1] = 'X';
    for (int i = 0; i < 6; ++i) {
        snprintf(macHex + (2 + i * 2), 3, "%02X", mac[i]);
    }
    DMESG("USB serial: %s", macHex);
    descriptor_str[3] = macHex;
    tusb_cfg.string_descriptor = (char **)descriptor_str;

    ESP_ERROR_CHECK(tinyusb_driver_install(&tusb_cfg));

    tinyusb_config_cdcacm_t amc_cfg;
    memset(&amc_cfg, 0, sizeof(amc_cfg));
    amc_cfg.usb_dev = TINYUSB_USBDEV_0;
    amc_cfg.cdc_port = TINYUSB_CDC_ACM_0;
    amc_cfg.rx_unread_buf_sz = 64;
    amc_cfg.callback_rx = &on_cdc_rx;
    amc_cfg.callback_line_state_changed = &on_cdc_line_state_changed;
    ESP_ERROR_CHECK(tusb_cdc_acm_init(&amc_cfg));

    LOG("init done");
}

void HF2::recv(uint8_t buf[64]) {
    uint8_t tag = buf[0];
    if (pkt.size && (tag & HF2_FLAG_SERIAL_OUT)) {
        ERROR("serial in middle of cmd");
        return;
    }

    int size = tag & HF2_SIZE_MASK;
    if (pkt.size + size > (int)sizeof(pkt.buf)) {
        ERROR("pkt too large");
        return;
    }

    memcpy(pkt.buf + pkt.size, buf + 1, size);
    pkt.size += size;
    tag &= HF2_FLAG_MASK;
    if (tag != HF2_FLAG_CMDPKT_BODY) {
        if (tag == HF2_FLAG_CMDPKT_LAST)
            pkt.serial = 0;
        else if (tag == HF2_FLAG_SERIAL_OUT)
            pkt.serial = 1;
        else
            pkt.serial = 2;
        int sz = pkt.size;
        pkt.size = 0;
        handlePkt(sz);
    }
}

const char *uf2_info() {
    return "ESP32-S2";
}

void reboot_to_uf2(void);

static void jdLog(const uint8_t *frame) {
    hf2.sendEvent(HF2_EV_JDS_PACKET, frame, frame[2] + 12);
}

int HF2::handlePkt(int sz) {
    if (pkt.serial) {
        // TODO raise some event?
        return 0;
    }

    LOGV("HF2 sz=%d CMD=%x", sz, pkt.buf32[0]);

    // one has to be careful dealing with these, as they share memory
    HF2_Command *cmd = &pkt.cmd;
    HF2_Response *resp = &pkt.resp;

    uint32_t cmdId = cmd->command_id;
    resp->tag = cmd->tag;
    resp->status16 = HF2_STATUS_OK;

    //#define checkDataSize(str, add) assert(sz == 8 + (int)sizeof(cmd->str) + (int)(add))

    // lastExchange = current_time_ms();
    gotSomePacket = true;

    switch (cmdId) {
    case HF2_CMD_INFO:
        return sendResponseWithData(uf2_info(), strlen(uf2_info()));

    case HF2_CMD_BININFO:
        resp->bininfo.mode = HF2_MODE_USERSPACE;
        resp->bininfo.flash_page_size = 0;
        resp->bininfo.flash_num_pages = 0;
        resp->bininfo.max_message_size = sizeof(pkt.buf);
        resp->bininfo.uf2_family = 0xbfdd4eee;
        return sendResponse(sizeof(resp->bininfo));

    case HF2_CMD_RESET_INTO_APP:
        target_reset();
        break;

    case HF2_CMD_RESET_INTO_BOOTLOADER:
        reboot_to_uf2();
        break;

    case HF2_CMD_DMESG:
        // TODO
        break;

    case HF2_CMD_JDS_CONFIG:
        if (cmd->data8[0]) {
            pxt::logJDFrame = jdLog;
        } else {
            pxt::logJDFrame = NULL;
        }
        return sendResponse(0);

    case HF2_CMD_JDS_SEND:
        if (pxt::sendJDFrame) {
            pxt::sendJDFrame(cmd->data8);
            return sendResponse(0);
        } else {
            resp->status16 = HF2_STATUS_INVALID_STATE;
            return sendResponse(0);
        }

    default:
        // command not understood
        resp->status16 = HF2_STATUS_INVALID_CMD;
        break;
    }

    return sendResponse(0);
}

struct BufferEntry {
    unsigned size;
    uint8_t flag;
    uint8_t data[0];
};

static void send_buffer_core(void *ent_) {
    auto ent = (BufferEntry *)ent_;

    uint32_t buf[64 / 4]; // aligned
    auto size = ent->size;
    auto data = ent->data;

    while (hf2.connected && size > 0) {
        memset(buf + 1, 0, 60);
        int s = 63;
        if (size <= 63) {
            s = size;
            buf[0] = ent->flag;
        } else {
            buf[0] = ent->flag == HF2_FLAG_CMDPKT_LAST ? HF2_FLAG_CMDPKT_BODY : ent->flag;
        }
        buf[0] |= s;
        uint8_t *dst = (uint8_t *)buf;
        dst++;
        memcpy(dst, data, s);
        data = data + s;
        size -= s;

        if (tinyusb_cdcacm_write_queue(TINYUSB_CDC_ACM_0, (uint8_t *)buf, sizeof(buf)) <
            sizeof(buf))
            DMESG("CDC write fail");
        // tinyusb_cdcacm_write_flush(TINYUSB_CDC_ACM_0, 0); - prints warnings
    }

    xfree(ent);
}

void HF2::sendBuffer(uint8_t flag, const void *data, unsigned size, uint32_t prepend) {
    if (!connected)
        return;

    if (prepend + 1)
        size += 4;

    auto ent = (BufferEntry *)xmalloc(sizeof(BufferEntry) + size);
    ent->size = size;
    ent->flag = flag;
    auto dst = ent->data;

    if (prepend + 1) {
        memcpy(dst, &prepend, 4);
        dst += 4;
        size -= 4;
    }

    memcpy(dst, data, size);

    if (worker_run_wait(fg_worker, send_buffer_core, ent))
        DMESG("HF2 queue full");
}

int HF2::sendEvent(uint32_t evId, const void *data, int size) {
    sendBuffer(HF2_FLAG_CMDPKT_LAST, data, size, evId);
    return 0;
}

int HF2::sendSerial(const void *data, int size, int isError) {
    if (!connected)
        return 0;

    sendBuffer(isError ? HF2_FLAG_SERIAL_ERR : HF2_FLAG_SERIAL_OUT, data, size);

    return 0;
}

int HF2::sendResponse(int size) {
    sendBuffer(HF2_FLAG_CMDPKT_LAST, pkt.buf, 4 + size);
    return 0;
}

int HF2::sendResponseWithData(const void *data, int size) {
    if (size <= (int)sizeof(pkt.buf) - 4) {
        memcpy(pkt.resp.data8, data, size);
        return sendResponse(size);
    } else {
        sendBuffer(HF2_FLAG_CMDPKT_LAST, data, size, pkt.resp.eventId);
        return 0;
    }
}

#endif

namespace pxt {
void sendSerial(const char *data, int len) {
    ets_printf(LOG_BOLD(LOG_COLOR_PURPLE) "%s" LOG_RESET_COLOR, data);
#if PXT_USB
    hf2.sendSerial(data, len);
#endif
}
} // namespace pxt

// https://gist.github.com/brgaulin/2dec28baf5e9e11dfd7ef8354adf103d
