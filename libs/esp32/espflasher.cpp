#include "pxt.h"
#include "Serial.h"

#define LOG DMESG
#define LOGV NOLOG

#define RST D12
#define BOOT D10

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

#define MODE_PRE 0
#define MODE_SKIP 1
#define MODE_WRITE 2
#define MODE_ERROR 3

static int mode;

typedef struct RegionDescriptor {
    uint32_t addr;
    uint32_t size;
    uint8_t md5[16];
} RegionDescriptor;

static uint32_t currUF2Block, flashSeq;
static RegionDescriptor currRegion;

typedef struct ESP_UF2_Block {
    uint32_t magicStart0;
    uint32_t magicStart1;
    uint32_t flags;
    uint32_t targetAddr;
    uint32_t payloadSize;
    uint32_t blockNo;
    uint32_t numBlocks;
    uint32_t familyID;
    uint8_t data[256];
    uint8_t padding[196];
    RegionDescriptor region;
    uint32_t magicEnd;
} ESP_UF2_Block;

static void startRead() {
    auto f = getWFlasher();
    if (!recvBuffer)
        recvBuffer = (uint8_t *)malloc(RECV_BUFFER_SIZE);
    recvBufferPos = 0;
    *(uint32_t *)recvBuffer = 0xDBDBDBDB;
    f->ser.abortDMA();
    f->ser.receiveDMA(recvBuffer, RECV_BUFFER_SIZE);
}

static int readAtMost(void *dst, int size) {
    auto f = getWFlasher();
    int numb = f->ser.getBytesReceived();
    // hack - if DMA reports bytes, but nothing was actually written, pretend there
    // are no bytes coming from DMA
    if (recvBufferPos == 0 && numb >= 2 && *(uint32_t *)recvBuffer == 0xDBDBDBDB)
        numb = 0;
    int curr = numb - recvBufferPos;
    if (curr < 0)
        target_panic(112);
    if (recvBufferPos == 0 && numb && recvBuffer[0] == 0xDB)
        LOG("len=%d sz=%d ", numb, size);
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
            target_panic(950);                                                                     \
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

static CmdHeader *sendRecvAndCheck(EspCommand cmd, const void *data, uint16_t dataSize,
                                   int timeout = QUICK_TIMEOUT) {
    sendEspCmd(cmd, data, dataSize);
    CmdHeader *res = readResponse(cmd, timeout);
    if (res->data[res->size - 4] != 0) {
        DMESG("command failed: %d, status=%x", cmd, res->data[res->size - 3]);
        return NULL;
    }
    res->size -= 4;
    return res;
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

static int connectFlash(uint32_t mode) {
    uint32_t args[2] = {mode, 0};

    if (!sendRecvAndCheck(ESP_SPI_ATTACH, args, sizeof(args)))
        return -1;

    uint32_t spiParams[] = {
        0,               // fl_id
        4 * 1024 * 1024, // size; assume 4M
        64 * 1024,       // block size
        4 * 1024,        // sector size
        256,             // page size
        0xffff,          // status mask
    };

    if (!sendRecvAndCheck(ESP_SPI_SET_PARAMS, spiParams, sizeof(spiParams)))
        return -2;

    return 0;
}

static int hexVal(uint8_t c) {
    if ('0' <= c && c <= '9')
        return c - '0';
    if ('a' <= c && c <= 'f')
        return 10 + c - 'a';
    return -1;
}

static int matchesMD5(RegionDescriptor *desc) {
    uint32_t args[] = {
        desc->addr,
        desc->size,
        0,
        0,
    };

    // assume 4ms per kb
    int timeout = desc->size / 1024 * 4 + 100;
    if (timeout < 500)
        timeout = 500;

    CmdHeader *res = sendRecvAndCheck(ESP_SPI_FLASH_MD5, args, sizeof(args), timeout);

    if (!res)
        return 0;

    if (res->size == 16)
        return memcmp(desc->md5, res->data, 16) == 0;
    else if (res->size == 32)
        for (int i = 0; i < 16; ++i) {
            int a = hexVal(res->data[2 * i]);
            int b = hexVal(res->data[2 * i + 1]);
            if ((a << 4) + b != desc->md5[i])
                return 0;
        }
    else
        return 0;

    return 1;
}

static int flashBegin(uint32_t addr, uint32_t size) {
    uint32_t args[] = {
        size,               // erase size
        (size + 255) / 256, // num blocks
        256,                // block size
        addr,               // offset
    };

    // assume 6ms per page erase time
    int timeout = size / 4096 * 6 + 100;
    if (timeout < 500)
        timeout = 500;

    if (!sendRecvAndCheck(ESP_FLASH_BEGIN, args, sizeof(args), timeout))
        return -3;

    return 0;
}

static int flashData(const void *data, int size, int seq) {
    uint32_t params[] = {(uint32_t)size, (uint32_t)seq, 0, 0};
    uint8_t *d = (uint8_t *)malloc(sizeof(params) + size);
    memcpy(d, params, sizeof(params));
    memcpy(d + sizeof(params), data, size);
    auto r = sendRecvAndCheck(ESP_FLASH_DATA, d, sizeof(params) + size, 1000);
    free(d);
    return r ? 0 : -1;
}

static void cleanup() {
    auto f = getWFlasher();
    f->ser.abortDMA();
    free(lastResponse);
    lastResponse = NULL;
}
static void resetESP() {
    auto boot = LOOKUP_PIN(BOOT);
    auto rst = LOOKUP_PIN(RST);
    boot->getDigitalValue();
    rst->setDigitalValue(0);
    fiber_sleep(50);
    rst->setDigitalValue(1);
}

static int connectESP() {
    LOG("resetting ESP");

    LOOKUP_PIN(TX)->setDigitalValue(1); // without this we get glitch on first character

    auto boot = LOOKUP_PIN(BOOT);
    auto rst = LOOKUP_PIN(RST);

    boot->setDigitalValue(1);
    rst->setDigitalValue(0);
    fiber_sleep(100);
    boot->setDigitalValue(0);
    fiber_sleep(2);
    rst->setDigitalValue(1);
    fiber_sleep(50);
    boot->getDigitalValue();

    LOG("syncing ESP");

    int ok = 0;

    for (int i = 0; i < 300; ++i) {
        if (sync()) {
            break;
            ok = 1;
        }
        fiber_sleep(50);
    }

    if (!ok)
        return -1;

    fiber_sleep(50);

    changeBaud(500000);

    LOG("synced!");

    uint32_t w3 = readEFuse(3);
    if (w3 == 0)
        return -2;
    LOG("chip: %d rev %d %s %d core %d MHz", (w3 >> 9) & 7, (w3 >> 15) & 1, w3 & 2 ? "noBT" : "BT",
        w3 & 1 ? 1 : 2, w3 & (1 << 13) ? (w3 & (1 << 12) ? 160 : 240) : -1);

    uint32_t m0 = readEFuse(2);
    uint32_t m1 = readEFuse(1);
    if (m0 == 0 || m1 == 0)
        return -3;
    LOG("mac: %x %x", m0 & 0xffff, m1);

    if (connectFlash(0) != 0)
        return -4;

    return 0;
}

int flashBlock(ESP_UF2_Block *block) {
    if (block->magicStart0 != 0x0A324655UL || block->magicStart1 != 0x9E5D5157UL ||
        block->magicEnd != 0x0AB16F30UL)
        return 0;
    if (block->familyID != 0x1c5f21b0)
        return 0;
    if (!(block->flags & 0x4000) || !block->region.size)
        return 1;

    if (mode == MODE_ERROR && block->blockNo != 0)
        return 1;

    if (block->blockNo == 0) {
        memset(&currRegion, 0, sizeof(currRegion));
        currUF2Block = 0;
        if (connectESP() != 0) {
            LOG("failed to connect to ESP");
            mode = MODE_ERROR;
            return 1;
        }
        mode = MODE_WRITE;
    }

    if (block->blockNo != currUF2Block) {
        LOG("block desync");
        mode = MODE_ERROR;
        return 1;
    }

    currUF2Block++;

    if (block->region.addr != currRegion.addr || block->region.size != currRegion.size) {
        // need to recompute
        currRegion = block->region;
        if (matchesMD5(&currRegion)) {
            LOG("region matches at %x/%d", currRegion.addr, currRegion.size);
            mode = MODE_SKIP;
        } else {
            if (flashBegin(currRegion.addr, currRegion.size) != 0) {
                LOG("failed to start write! %x/%d", currRegion.addr, currRegion.size);
                mode = MODE_ERROR;
                return 1;
            } else {
                LOG("writing region at %x/%d", currRegion.addr, currRegion.size);
                flashSeq = 0;
                mode = MODE_WRITE;
            }
        }
    }

    if (mode == MODE_WRITE) {
        if (flashData(block->data, 256, flashSeq++) != 0) {
            LOG("failed to write! seq=%d", flashSeq);
            mode = MODE_ERROR;
            return 1;
        }
    }

    if (currUF2Block == block->numBlocks) {
        mode = MODE_PRE;
        LOG("all done; reset ESP");
        cleanup();
        resetESP();
    }

    return 2;
}

//%
void flashDevice() {
    if (connectESP() != 0)
        return;

    cleanup();
}
} // namespace esp32spi
