#include "Flash.h"

#ifdef STM32F4
static void waitForLast() {
    while ((FLASH->SR & FLASH_SR_BSY) == FLASH_SR_BSY)
        ;
}

static void unlock() {
    FLASH->CR |= FLASH_CR_LOCK;
    FLASH->KEYR = FLASH_KEYR_KEY1;
    FLASH->KEYR = FLASH_KEYR_KEY2;
}

static void lock() {
    FLASH->CR |= FLASH_CR_LOCK;
}

int ZFlash::pageSize(uintptr_t address) {
    address |= 0x0800_0000;
    if (address < 0x0801_0000)
        return 16 * 1024;
    if (address < 0x0802_0000)
        return 64 * 1024;
    if (address < 0x0810_0000)
        return 128 * 1024;
    target_panic(950);
    return 0;
}

int ZFlash::erasePage(uintptr_t address) {
    waitForLast();
    unlock();

    address |= 0x0800_0000;
    uintptr_t ptr = 0x0800_0000;
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
    waitForLast();
    unlock();

    dst |= 0x0800_0000;

    FLASH->CR = FLASH_CR_PSIZE_1 | FLASH_CR_PG;

    union {
        uint8_t buf[4];
        uint32_t asuint;
    } data;

    while (len > 0) {
        int off = dst & 3;
        int n = 4 - off;
        if (n > len)
            n = len;
        if (off)
            memset(data.buf, 0xff, 4);

        memcpy(data.buf + off, src, n);
        src = (const uint8_t *)src + n;
        len -= n;

        *((volatile uint32_t *)dst) = data.asuint;
        waitForLast();
    }

    FLASH->CR = FLASH_CR_PSIZE_1;
    lock();

    return 0;
}
#endif
