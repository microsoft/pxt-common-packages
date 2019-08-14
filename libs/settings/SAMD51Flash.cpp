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
    while (NVMCTRL->INTFLAG.bit.READY == 0)                                                         \
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

int ZFlash::pageSize(uintptr_t address) {
#ifdef SAMD51
    if (address < 1024 * 1024)
        return NVMCTRL_BLOCK_SIZE; // 8k
#else
    if (address < 256 * 1024)
        return 256;
#endif
    target_panic(DEVICE_FLASH_ERROR);
    return 0;
}

int ZFlash::erasePage(uintptr_t address) {
    LOG("Erase %x", address);
#ifdef SAMD51
    NVMCTRL->CTRLA.bit.WMODE = NVMCTRL_CTRLA_WMODE_MAN_Val;
#else
    NVMCTRL->CTRLB.bit.MANW = 1;
#endif
    waitForLast();
    unlock();
    NVMCTRL->ADDR.reg = address;
    #ifdef SAMD51
    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_EB;
    #else
    NVMCTRL->CTRLA.reg = NVMCTRL_CTRLA_CMDEX_KEY | NVMCTRL_CTRLA_CMD_ER;
    #endif
    waitForLast();
    lock();
    return 0;
}

#if 0
#define CHECK_ECC() \
    if (NVMCTRL->INTFLAG.bit.ECCSE || NVMCTRL->INTFLAG.bit.ECCDE) \
        target_panic(DEVICE_FLASH_ERROR)
#else
#define CHECK_ECC() ((void)0)
#endif



int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
#ifdef SAMD51
    CHECK_ECC();

    // only allow writing double word at a time
    if (len & 7)
        target_panic(DEVICE_FLASH_ERROR);
    if (dst & 7)
        target_panic(DEVICE_FLASH_ERROR);

    // every double-word can only be written once, otherwise we get ECC errors
    // and no, ECC cannot be disabled
    for (int i = 0; i < (len >> 3); ++i)
        if (((uint64_t*)dst)[i] != 0xffffffffffffffff &&
            ((uint64_t*)src)[i] != 0xffffffffffffffff)
            target_panic(DEVICE_FLASH_ERROR);
#else
#endif

    volatile uint32_t *dp = (uint32_t *)dst;
    uint32_t *sp = (uint32_t *)src;
    uint32_t n = len >> 2;

    waitForLast();
    unlock();
    __DMB();

    target_disable_irq();

    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_PBC;
    waitForLast();

    while (n--) {
        auto v = *sp++;
        *dp = v;
        dp++;
    }

    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_WQW;
    waitForLast();

    target_enable_irq();

    lock();

    CHECK_ECC();

    return 0;
}
} // namespace codal
#endif
