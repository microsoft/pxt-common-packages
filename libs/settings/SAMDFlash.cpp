#include "pxt.h"
#include "Flash.h"

//#define LOG DMESG
#define LOG NOLOG

#if defined(SAMD51) || defined(SAMD21)
namespace codal {

#ifdef SAMD51
#define waitForLast()                                                                              \
    while (NVMCTRL->STATUS.bit.READY == 0)                                                         \
        ;
#else
#define waitForLast()                                                                              \
    while (NVMCTRL->INTFLAG.bit.READY == 0)                                                        \
        ;
#endif

static void unlock() {
#ifdef SAMD51
    // see errata 2.14.1
    NVMCTRL->CTRLA.bit.CACHEDIS0 = true;
    NVMCTRL->CTRLA.bit.CACHEDIS1 = true;

    CMCC->CTRL.bit.CEN = 0;
    while (CMCC->SR.bit.CSTS) {
    }
    CMCC->MAINT0.bit.INVALL = 1;
#endif
}

static void lock() {
#ifdef SAMD51
    // re-enable cache
    NVMCTRL->CTRLA.bit.CACHEDIS0 = false;
    NVMCTRL->CTRLA.bit.CACHEDIS1 = false;

    // re-enable cortex-m cache - it's a separate one
    CMCC->CTRL.bit.CEN = 0;
    while (CMCC->SR.bit.CSTS) {
    }
    CMCC->MAINT0.bit.INVALL = 1;
    CMCC->CTRL.bit.CEN = 1;
#endif
}

int ZFlash::totalSize() {
    return (8 << NVMCTRL->PARAM.bit.PSZ) * NVMCTRL->PARAM.bit.NVMP;
}

// this returns the size of "page" that can be erased ("row" in datasheet)
int ZFlash::pageSize(uintptr_t address) {
#ifdef SAMD51
    if (address < (uintptr_t)totalSize())
        return NVMCTRL_BLOCK_SIZE; // 8k
#else
    if (address < (uintptr_t)totalSize())
        return 256;
#endif
    target_panic(DEVICE_FLASH_ERROR);
    return 0;
}

#ifdef SAMD51
#define CMD(D21, D51) NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | D51
#else
#define CMD(D21, D51) NVMCTRL->CTRLA.reg = NVMCTRL_CTRLA_CMDEX_KEY | D21
#endif

int ZFlash::erasePage(uintptr_t address) {
    LOG("Erase %x", address);
#ifdef SAMD51
    NVMCTRL->CTRLA.bit.WMODE = NVMCTRL_CTRLA_WMODE_MAN_Val;
#else
    NVMCTRL->CTRLB.bit.MANW = 1;
#endif
    waitForLast();
    unlock();
#ifdef SAMD51
    NVMCTRL->ADDR.reg = address;
#else
    // yeah... /2
    NVMCTRL->ADDR.reg = address / 2;
#endif
    CMD(NVMCTRL_CTRLA_CMD_ER, NVMCTRL_CTRLB_CMD_EB);
    waitForLast();
    lock();
    return 0;
}

#if 0
#define CHECK_ECC()                                                                                \
    if (NVMCTRL->INTFLAG.bit.ECCSE || NVMCTRL->INTFLAG.bit.ECCDE)                                  \
    return -10
#else
#define CHECK_ECC() ((void)0)
#endif

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
#ifdef SAMD51
    CHECK_ECC();

    // only allow writing double word at a time
    if (len & 7)
        return -1;
    if (dst & 7)
        return -2;

    // every double-word can only be written once, otherwise we get ECC errors
    // and no, ECC cannot be disabled
    for (unsigned i = 0; i < (len >> 3); ++i)
        if (((uint64_t *)dst)[i] != 0xffffffffffffffff &&
            ((uint64_t *)src)[i] != 0xffffffffffffffff)
            return -3;
#define WRITE_SIZE 16
#else
    if ((dst & 3) || (len & 3))
        return -1;

    for (unsigned i = 0; i < len; ++i)
        if (((uint8_t *)dst)[i] != 0xff && ((uint8_t *)src)[i] != 0xff)
            return -3;
#define WRITE_SIZE 64
#endif

    uint32_t writeBuf[WRITE_SIZE >> 2];
    uint32_t idx = 0;

    waitForLast();
    unlock();
    __DMB();

    while (idx < len) {
        uint32_t off = dst & (WRITE_SIZE - 1);
        uint32_t n = WRITE_SIZE - off;
        if (n > len - idx)
            n = len - idx;
        uint32_t *sp;
        volatile uint32_t *dp;
        if (n != WRITE_SIZE) {
            memset(writeBuf, 0xff, WRITE_SIZE);
            memcpy((uint8_t *)writeBuf + off, src, n);
            sp = writeBuf;
            dp = (uint32_t *)(dst - off);
        } else {
            sp = (uint32_t *)src;
            dp = (uint32_t *)dst;
        }

        bool need = false;
        for (unsigned i = 0; i < (WRITE_SIZE >> 2); ++i)
            if (sp[i] != 0xffffffff) {
                need = true;
                break;
            }

        if (need) {
            CMD(NVMCTRL_CTRLA_CMD_PBC, NVMCTRL_CTRLB_CMD_PBC);
            waitForLast();

            uint32_t q = WRITE_SIZE >> 2;

            target_disable_irq();
            while (q--) {
                auto v = *sp++;
                *dp = v;
                dp++;
            }

            CMD(NVMCTRL_CTRLA_CMD_WP, NVMCTRL_CTRLB_CMD_WQW);
            target_enable_irq();
            waitForLast();
        }

        src = (uint8_t *)src + n;
        dst += n;
        idx += n;
    }

    CHECK_ECC();

    lock();

    return 0;
}
} // namespace codal
#endif
