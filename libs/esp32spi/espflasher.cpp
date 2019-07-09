#include "pxt.h"
#include "Serial.h"

#define LOG DMESG
#define LOGV NOLOG

#define SYNC_TIMEOUT 100
#define QUICK_TIMEOUT 500

namespace esp32spi {

class WFlasher {
  public:
    CODAL_JACDAC_WIRE_SERIAL ser;
    WFlasher() : ser(*LOOKUP_PIN(TX), LOOKUP_PIN(RX)) { ser.setBaud(115200); }
};

SINGLETON_IF_PIN(WFlasher, RX);

#define RECV_BUFFER_SIZE 1024
static uint8_t *recvBuffer;
static uint32_t recvBufferPos;

static void startRead() {
    auto f = getWFlasher();
    if (!recvBuffer)
        recvBuffer = (uint8_t *)malloc(RECV_BUFFER_SIZE);
    recvBufferPos = 0;
    *(uint32_t*)recvBuffer = 0xDBDBDBDB;
    f->ser.abortDMA();
    f->ser.receiveDMA(recvBuffer, RECV_BUFFER_SIZE);
}

int lastCurr;

static int readAtMost(void *dst, int size) {
    auto f = getWFlasher();
    int numb = f->ser.getBytesReceived();
    // hack - if DMA reports bytes, but nothing was actually written, pretend there
    // are no bytes coming from DMA
    if (recvBufferPos == 0 && numb >= 2 && *(uint32_t*)recvBuffer == 0xDBDBDBDB)
        numb = 0;
    int curr = numb - recvBufferPos;
    if (curr < 0)
        target_panic(112);
    if (recvBufferPos == 0 && numb && recvBuffer[0] == 0xDB)
        LOG("len=%d sz=%d ", numb, size);
    // lastCurr = curr;
    // LOG("%d/%d/%d", recvBufferPos, curr, size);
    if (curr > size)
        curr = size;
    if (dst)
        memcpy(dst, recvBuffer + recvBufferPos, curr);
    recvBufferPos += curr;
    return curr;
}

static int readByte() {
    uint8_t c;
    if (readAtMost(&c, 1) == 1)
        return c;
    return -1;
}

enum EspCommand {
    ESP_FLASH_BEGIN = 0x02,
    ESP_FLASH_DATA = 0x03,
    ESP_FLASH_END = 0x04,
    ESP_MEM_BEGIN = 0x05,
    ESP_MEM_END = 0x06,
    ESP_MEM_DATA = 0x07,
    ESP_SYNC = 0x08,
    ESP_WRITE_REG = 0x09,
    ESP_READ_REG = 0x0a,
    ESP_SPI_SET_PARAMS = 0x0B,
    ESP_SPI_ATTACH = 0x0D,
    ESP_CHANGE_BAUDRATE = 0x0F,
    ESP_FLASH_DEFL_BEGIN = 0x10,
    ESP_FLASH_DEFL_DATA = 0x11,
    ESP_FLASH_DEFL_END = 0x12,
    ESP_SPI_FLASH_MD5 = 0x13,
};

#define XASSERT(cond)                                                                              \
    do {                                                                                           \
        if (!(cond))                                                                               \
            target_panic(920);                                                                     \
    } while (0)

struct CmdHeader {
    uint8_t direction;
    uint8_t cmd;
    uint16_t size;
    uint32_t val;
    uint8_t data[0];
};

static int slipSize(const void *data, int sz) {
    const uint8_t *s = (const uint8_t *)data;
    int r = 0;
    for (int i = 0; i < sz; ++i) {
        if (s[i] == 0xC0 || s[i] == 0xDB) {
            r += 2;
        } else {
            r += 1;
        }
    }
    return r;
}

static int slipWrite(void *trg, const void *data, int sz) {
    const uint8_t *s = (const uint8_t *)data;
    uint8_t *d = (uint8_t *)trg;
    int r = 0;
    for (int i = 0; i < sz; ++i) {
        if (s[i] == 0xC0) {
            d[r++] = 0xDB;
            d[r++] = 0xDC;
        } else if (s[i] == 0xDB) {
            d[r++] = 0xDB;
            d[r++] = 0xDD;
        } else {
            d[r++] = s[i];
        }
    }
    return r;
}

static void sendEspCmd(EspCommand cmd, const void *data, uint16_t dataSize, int checksum = 0) {
    LOGV("send cmd: %x with %d bytes of data", cmd, dataSize);

    CmdHeader hd;
    hd.direction = 0;
    hd.cmd = cmd;
    hd.size = dataSize;
    hd.val = checksum;

    int totalSize = 1 + slipSize(&hd, sizeof(hd)) + slipSize(data, dataSize) + 1;
    uint8_t *buf = (uint8_t *)malloc(totalSize);
    int p = 0;
    buf[p++] = 0xC0;
    p += slipWrite(buf + p, &hd, sizeof(hd));
    p += slipWrite(buf + p, data, dataSize);
    buf[p++] = 0xC0;
    XASSERT(p == totalSize);

    auto f = getWFlasher();
    startRead(); // make sure not to miss the response
    fiber_wake_on_event(f->ser.id, SWS_EVT_DATA_SENT);
    f->ser.sendDMA(buf, totalSize);
    schedule();
    free(buf);
}

static int readBytes(void *data, int dataSize, int timeout) {
    LOGV("read resp: sz=%d", dataSize);
    uint8_t *dp = (uint8_t *)data;
    int prevTm = current_time_ms();
    int atDB = 0;
    while (dataSize > 0) {
        int num = readAtMost(dp, dataSize);
        int now = current_time_ms();
        if (num == 0) {
            if (now - prevTm > timeout) {
                LOG("read timeout; pos=%d, left=%d to=%d", dp - (uint8_t *)data, dataSize, timeout);
                getWFlasher()->ser.sendDMA(recvBuffer, 1);
                return dp - (uint8_t *)data;
            }
            continue;
        }

        prevTm = now;

        uint8_t *t0 = dp;
        uint8_t *t = dp;

        if (atDB) {
            num--;
            goto contDB;
        }

        while (num--) {
            if (*dp == 0xDB) {
                dp++;
                if (num == 0) {
                    atDB = 1;
                    break;
                }
            contDB:
                if (*dp == 0xDD)
                    *t++ = 0xDB;
                else if (*dp == 0xDC)
                    *t++ = 0xC0;
                else {
                    // pass as is?
                    LOG("invalid quote: %x", *dp);
                    *t++ = 0xDB;
                    *t++ = *dp;
                }
                dp++;
            } else {
                if (*dp == 0xC0)
                    LOG("invalid C0");
                *t++ = *dp++;
            }
        }
        dataSize -= t - t0;
        dp = t;
    }

    return dp - (uint8_t *)data;
}

static int waitC0(int timeout) {
    int startTm = current_time_ms();
    for (;;) {
        if (current_time_ms() - startTm > timeout) {
            LOG("C0 timeout");
            return 0;
        }
        int ch = readByte();
        if (ch == 0xC0)
            return 1;
        if (ch >= 0)
            LOG("waiting for C0, got %x", ch);
    }
}

static void flushInput() {
    readAtMost(NULL, RECV_BUFFER_SIZE);
}

static CmdHeader *lastResponse;

static CmdHeader *readResponse(EspCommand cmd, int timeout = 100) {
    if (!waitC0(timeout))
        return NULL;

    CmdHeader hd;
    int sz = readBytes(&hd, sizeof(hd), timeout);
    if (sz != sizeof(hd))
        return NULL;
    if (hd.direction != 1) {
        LOG("invalid direction");
        return NULL;
    }
    if (hd.cmd != cmd) {
        LOG("invalid response cmd");
        return NULL;
    }
    if (hd.size < 4) {
        LOG("invalid response size");
        return NULL;
    }
    CmdHeader *res = (CmdHeader *)malloc(sizeof(CmdHeader) + hd.size);
    memcpy(res, &hd, sizeof(hd));
    sz = readBytes(res->data, res->size, timeout);

    if (sz != res->size) {
        free(res);
        return NULL;
    }

    if (!waitC0(timeout)) {
        free(res);
        return NULL;
    }

    if (lastResponse)
        free(lastResponse);
    lastResponse = res;

    return res;
}

static CmdHeader *sendAndRecv(EspCommand cmd, const void *data, uint16_t dataSize,
                              int timeout = QUICK_TIMEOUT) {
    sendEspCmd(cmd, data, dataSize);
    return readResponse(cmd, timeout);
}

static const char *syncPayload = "\x07\x07\x12\x20"
                                 "UUUUUUUU"
                                 "UUUUUUUU"
                                 "UUUUUUUU"
                                 "UUUUUUUU";

static int sync() {
    if (sendAndRecv(ESP_SYNC, syncPayload, 4 + 32, SYNC_TIMEOUT) == NULL)
        return 0;

    fiber_sleep(50);
    flushInput();

    return 1;
}

static uint32_t readReg(uint32_t addr) {
    CmdHeader *res = sendAndRecv(ESP_READ_REG, &addr, sizeof(addr));
    if (!res)
        return 0;
    if (res->data[0] != 0)
        DMESG("invalid read reg");
    return res->val;
}

#define EFUSE_REG_BASE 0x6001a000

static uint32_t readEFuse(int id) {
    return readReg(EFUSE_REG_BASE + id * 4);
}

static void changeBaud(uint32_t baud) {
    uint32_t args[2] = {baud, 0};
    sendAndRecv(ESP_CHANGE_BAUDRATE, args, 8);
    getWFlasher()->ser.setBaud(baud);
    startRead();
    fiber_sleep(50);
    flushInput();
}

//%
void flashDevice(DigitalInOutPin rst, DigitalInOutPin boot) {
    LOG("resetting ESP");

    LOOKUP_PIN(TX)->setDigitalValue(1); // without this we get glitch on first character

    boot->setDigitalValue(1);
    rst->setDigitalValue(0);
    fiber_sleep(100);
    boot->setDigitalValue(0);
    fiber_sleep(2);
    rst->setDigitalValue(1);
    fiber_sleep(50);
    boot->getDigitalValue();

    LOG("syncing ESP");

    for (int i = 0; i < 20000; ++i) {
        if (sync())
            break;
        fiber_sleep(50);
    }

    fiber_sleep(50);

    changeBaud(2000000);

    LOG("synced!");

    uint32_t w3 = readEFuse(3);
    LOG("chip: %d rev %d %s %d core %d MHz", (w3 >> 9) & 7, (w3 >> 15) & 1, w3 & 2 ? "noBT" : "BT",
        w3 & 1 ? 1 : 2, w3 & (1 << 13) ? (w3 & (1 << 12) ? 160 : 240) : -1);

    uint32_t m0 = readEFuse(2);
    uint32_t m1 = readEFuse(1);
    LOG("mac: %x %x", m0, m1);

    int iter = 0;

    while (1) {
        if (iter++ % 1000 == 0)
        DMESG("i=%d", iter);
        auto tmp = readEFuse(2);
        if (tmp != m0)
            target_panic(111);
    }

    free(lastResponse);
    lastResponse = NULL;
}
} // namespace esp32spi
