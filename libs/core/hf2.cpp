#define UF2_DEFINE_HANDOVER 1
#include "hf2.h"
#include "uf2format.h"
#include "CodalDmesg.h"

#define LOG DMESG
//#define LOG(...) ((void)0)

#if CONFIG_ENABLED(DEVICE_USB)

static const char hidDescriptor[] = {
    0x06, 0x97, 0xFF, // usage page vendor 0x97 (usage 0xff97 0x0001)
    0x09, 0x01,       // usage 1
    0xA1, 0x01,       // collection - application
    0x15, 0x00,       // logical min 0
    0x26, 0xFF, 0x00, // logical max 255
    0x75, 8,          // report size 8
    0x95, 64,         // report count 64
    0x09, 0x01,       // usage 1
    0x81, 0x02,       // input: data, variable, absolute
    0x95, 64,         // report count 64
    0x09, 0x01,       // usage 1
    0x91, 0x02,       // output: data, variable, absolute
    0x95, 1,          // report count 1
    0x09, 0x01,       // usage 1
    0xB1, 0x02,       // feature: data, variable, absolute
    0xC0,             // end
};

static const HIDReportDescriptor reportDesc = {
    9,
    0x21,                  // HID
    0x100,                 // hidbcd 1.00
    0x00,                  // country code
    0x01,                  // num desc
    0x22,                  // report desc type
    sizeof(hidDescriptor), // size of 0x22
};

static const InterfaceInfo ifaceInfo = {
    &reportDesc,
    sizeof(reportDesc),
    1,
    {
        2,    // numEndpoints
        0x03, /// class code - HID
        0x00, // subclass
        0x00, // protocol
        0x00, //
        0x00, //
    },
    {USB_EP_TYPE_INTERRUPT, 1},
    {USB_EP_TYPE_INTERRUPT, 1},
};

int HF2::stdRequest(UsbEndpointIn &ctrl, USBSetup &setup)
{
    if (setup.bRequest == GET_DESCRIPTOR)
    {
        if (setup.wValueH == 0x21)
        {
            InterfaceDescriptor tmp;
            fillInterfaceInfo(&tmp);
            return ctrl.write(&tmp, sizeof(tmp));
        }
        else if (setup.wValueH == 0x22)
        {
            return ctrl.write(hidDescriptor, sizeof(hidDescriptor));
        }
    }
    return DEVICE_NOT_SUPPORTED;
}

const InterfaceInfo *HF2::getInterfaceInfo()
{
    return &ifaceInfo;
}

int HF2::sendSerial(const void *data, int size, int isError)
{
    return send(data, size, isError ? HF2_FLAG_SERIAL_ERR : HF2_FLAG_SERIAL_OUT);
}

// Recieve HF2 message
// Does not block. Will store intermediate data in pkt.
// `serial` flag is cleared if we got a command message.
int HF2::recv()
{
    uint8_t buf[64];
    int len = out->read(buf, sizeof(buf));
    if (len <= 0)
        return len;

    uint8_t tag = buf[0];
    // serial packets not allowed when in middle of command packet
    usb_assert(pkt.size == 0 || !(tag & HF2_FLAG_SERIAL_OUT));
    int size = tag & HF2_SIZE_MASK;
    usb_assert(pkt.size + size <= (int)sizeof(pkt.buf));
    memcpy(pkt.buf + pkt.size, buf + 1, size);
    pkt.size += size;
    tag &= HF2_FLAG_MASK;
    if (tag != HF2_FLAG_CMDPKT_BODY)
    {
        if (tag == HF2_FLAG_CMDPKT_LAST)
            pkt.serial = 0;
        else if (tag == HF2_FLAG_SERIAL_OUT)
            pkt.serial = 1;
        else
            pkt.serial = 2;
        int sz = pkt.size;
        pkt.size = 0;
        return sz;
    }
    return 0;
}

// Send HF2 message.
// Use command message when flag == HF2_FLAG_CMDPKT_LAST
// Use serial stdout for HF2_FLAG_SERIAL_OUT and stderr for HF2_FLAG_SERIAL_ERR.
int HF2::send(const void *data, int size, int flag0)
{
    uint8_t buf[64];
    const uint8_t *ptr = (const uint8_t *)data;

    if (!CodalUSB::usbInstance->isInitialised())
        return -1;

    for (;;)
    {
        int s = 63;
        int flag = flag0;
        if (size <= 63)
        {
            s = size;
        }
        else
        {
            if (flag == HF2_FLAG_CMDPKT_LAST)
                flag = HF2_FLAG_CMDPKT_BODY;
        }
        buf[0] = flag | s;
        memcpy(buf + 1, ptr, s);
        if (in->write(buf, sizeof(buf)) < 0)
            return -1;
        ptr += s;
        size -= s;
        if (!size)
            break;
    }
    return 0;
}

int HF2::sendResponse(int size)
{
    return send(pkt.buf, 4 + size, HF2_FLAG_CMDPKT_LAST);
}

int HF2::sendResponseWithData(const void *data, int size)
{
    int res;

    if (size <= (int)sizeof(pkt.buf) - 4)
    {
        __disable_irq();
        memcpy(pkt.resp.data8, data, size);
        __enable_irq();
        res = sendResponse(size);
    }
    else
    {
        __disable_irq();
        send(pkt.buf, 4, HF2_FLAG_CMDPKT_BODY);
        res = send(data, size, HF2_FLAG_CMDPKT_LAST);
        __enable_irq();
    }

    return res;
}

static void copy_words(void *dst0, const void *src0, uint32_t n_words)
{
    uint32_t *dst = (uint32_t *)dst0;
    const uint32_t *src = (const uint32_t *)src0;
    while (n_words--)
        *dst++ = *src++;
}

int HF2::endpointRequest()
{
    int sz = recv();

    if (!sz)
        return 0;

    uint32_t tmp;

    if (pkt.serial)
    {
        // TODO raise some event?
        return 0;
    }

    LOG("HF2 sz=%d CMD=%x", sz, pkt.buf32[0]);

    // one has to be careful dealing with these, as they share memory
    HF2_Command *cmd = &pkt.cmd;
    HF2_Response *resp = &pkt.resp;

    uint32_t cmdId = cmd->command_id;
    resp->tag = cmd->tag;
    resp->status16 = HF2_STATUS_OK;

#define checkDataSize(str, add) usb_assert(sz == 8 + (int)sizeof(cmd->str) + (int)(add))

    switch (cmdId)
    {
    case HF2_CMD_INFO:
        return sendResponseWithData(uf2_info(), strlen(uf2_info()));

    case HF2_CMD_BININFO:
        resp->bininfo.mode = HF2_MODE_USERSPACE;
        resp->bininfo.flash_page_size = 0;
        resp->bininfo.flash_num_pages = 0;
        resp->bininfo.max_message_size = sizeof(pkt.buf);
        return sendResponse(sizeof(resp->bininfo));

    case HF2_CMD_RESET_INTO_APP:
    case HF2_CMD_RESET_INTO_BOOTLOADER:
        device.reset();
        break;

    case HF2_CMD_START_FLASH:
        sendResponse(0);
        hf2_handover(in->ep);
        usb_assert(0); // should not be reached
        break;

    case HF2_CMD_WRITE_WORDS:
        checkDataSize(write_words, cmd->write_words.num_words << 2);
        copy_words((void *)cmd->write_words.target_addr, cmd->write_words.words,
                   cmd->write_words.num_words);
        break;

    case HF2_CMD_READ_WORDS:
        checkDataSize(read_words, 0);
        tmp = cmd->read_words.num_words;
        usb_assert(tmp <= sizeof(pkt.buf) / 4 - 1);
        copy_words(resp->data32, (void *)cmd->read_words.target_addr, tmp);
        return sendResponse(tmp << 2);

    case HF2_CMD_DMESG:
#if DEVICE_DMESG_BUFFER_SIZE > 0
        return sendResponseWithData(codalLogStore.buffer, codalLogStore.ptr);
#else
        break;
#endif

    default:
        // command not understood
        resp->status16 = HF2_STATUS_INVALID_CMD;
        break;
    }

    return sendResponse(0);
}

HF2::HF2() : USBHID()
{
}

#endif
