#include "pxt.h"
#include "Flash.h"

#define LOG DMESG
//#define LOG NOLOG

#ifdef STM32F4
namespace codal {
static void waitForLast() {
    while ((FLASH->SR & FLASH_SR_BSY) == FLASH_SR_BSY)
        ;
}

static void unlock() {
    FLASH->CR |= FLASH_CR_LOCK;
    FLASH->KEYR = FLASH_KEY1;
    FLASH->KEYR = FLASH_KEY2;
}

static void lock() {
    FLASH->CR |= FLASH_CR_LOCK;
}

int ZFlash::pageSize(uintptr_t address) {
    address |= 0x08000000;
    if (address < 0x08010000)
        return 16 * 1024;
    if (address < 0x08020000)
        return 64 * 1024;
    if (address < 0x08100000)
        return 128 * 1024;
    target_panic(950);
    return 0;
}

int ZFlash::erasePage(uintptr_t address) {
    waitForLast();
    unlock();

    address |= 0x08000000;
    uintptr_t ptr = 0x08000000;
    int sectNum = 0;
    while (1) {
        ptr += pageSize(ptr);
        if (ptr > address)
            break;
        sectNum++;
    }

    FLASH->CR = FLASH_CR_PSIZE_1 | (sectNum << FLASH_CR_SNB_Pos) | FLASH_CR_SER;
    FLASH->CR |= FLASH_CR_STRT;

    waitForLast();

    FLASH->CR = FLASH_CR_PSIZE_1;
    lock();

    // cache flushing only required after erase, not programming (3.5.4)
    __HAL_FLASH_DATA_CACHE_DISABLE();
    __HAL_FLASH_DATA_CACHE_RESET();
    __HAL_FLASH_DATA_CACHE_ENABLE();

    // we skip instruction cache, as we're not expecting to erase that

    return 0;
}

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
    LOG("WR flash at %p len=%d", (void *)dst, len);
    waitForLast();
    unlock();

    dst |= 0x08000000;

    FLASH->CR = FLASH_CR_PSIZE_1 | FLASH_CR_PG;

    union {
        uint8_t buf[4];
        uint32_t asuint;
    } data;

    while (len > 0) {
        int off = dst & 3;
        int n = 4 - off;
        if (n > (int)len)
            n = len;
        if (n != 4)
            memset(data.buf, 0xff, 4);

        memcpy(data.buf + off, src, n);

        *((volatile uint32_t *)dst) = data.asuint;

        dst += n;
        src = (const uint8_t *)src + n;
        len -= n;

        waitForLast();
    }

    FLASH->CR = FLASH_CR_PSIZE_1;
    lock();

    LOG("WR flash OK");

    return 0;
}
} // namespace codal
#endif

#ifdef SAMD51
namespace codal {
#define waitForLast()                                                                              \
    while (NVMCTRL->STATUS.bit.READY == 0)                                                         \
        ;

static void unlock() {
    // see errata 2.14.1
    NVMCTRL->CTRLA.bit.CACHEDIS0 = true;
    NVMCTRL->CTRLA.bit.CACHEDIS1 = true;

    CMCC->CTRL.bit.CEN = 0;
    while (CMCC->SR.bit.CSTS) {}
    CMCC->MAINT0.bit.INVALL = 1;
}

static void lock() {
    // re-enable cache
    NVMCTRL->CTRLA.bit.CACHEDIS0 = false;
    NVMCTRL->CTRLA.bit.CACHEDIS1 = false;
    // re-enable cortex-m cache - it's a separate one
    CMCC->CTRL.bit.CEN = 1;
}

int ZFlash::pageSize(uintptr_t address) {
    if (address < 1024 * 1024)
        return NVMCTRL_BLOCK_SIZE; // 8k
    target_panic(950);
    return 0;
}

int ZFlash::erasePage(uintptr_t address) {
    NVMCTRL->CTRLA.bit.WMODE = NVMCTRL_CTRLA_WMODE_MAN;
    waitForLast();
    unlock();
    NVMCTRL->ADDR.reg = address;
    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_EB;
    waitForLast();
    lock();
    return 0;
}

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
    LOG("WR flash at %p len=%d %x %x %x", (void *)dst, len, ((uint8_t*)src)[0], ((uint8_t*)src)[1], NVMCTRL->CTRLA.reg);

    for (unsigned i = 0; i < len; ++i) {
        if (((uint8_t*)src)[i] != 0xff &&
            ((uint8_t*)dst)[i] != 0xff)
            target_panic(990);
    }

    volatile uint32_t *dp = (uint32_t*)dst;
    uint32_t *sp = (uint32_t*)src;
    uint32_t n = len >> 2;

    waitForLast();
    unlock();

    __DMB();

    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_PBC;
    waitForLast();

    while (n--)
        *dp++ = *sp++;


        //for (unsigned i = 0; i < len / 4; ++i)
        //    ((volatile uint32_t *)dst)[i] = ((uint32_t*)src)[i];

        NVMCTRL->ADDR.reg = (uint32_t)dst; // not needed?
        NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_WP;
        waitForLast();


    lock();

    LOG("WR flash OK");

    return 0;
}
} // namespace codal
#endif
