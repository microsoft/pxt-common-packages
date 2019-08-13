#include "pxt.h"
#include "Flash.h"

#define LOG DMESG
//#define LOG NOLOG

#ifdef SAMD51
namespace codal {
#define waitForLast()                                                                              \
    while (NVMCTRL->STATUS.bit.READY == 0)                                                         \
        ;

static void unlock() {
#if 1
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
#if 1
    // re-enable cache
    NVMCTRL->CTRLA.bit.CACHEDIS0 = false;
    NVMCTRL->CTRLA.bit.CACHEDIS1 = false;
#endif
    // re-enable cortex-m cache - it's a separate one
    CMCC->CTRL.bit.CEN = 0;
    while (CMCC->SR.bit.CSTS) {
    }
    CMCC->MAINT0.bit.INVALL = 1;
    CMCC->CTRL.bit.CEN = 1;
}

int ZFlash::pageSize(uintptr_t address) {
    if (address < 1024 * 1024)
        return NVMCTRL_BLOCK_SIZE; // 8k
    target_panic(950);
    return 0;
}

#define FLASH_BASE (512 * 1024 - 32 * 1024)
//static uint8_t flashCopy[32 * 1024];

int ZFlash::erasePage(uintptr_t address) {
    LOG("Erase %x", address);
    NVMCTRL->CTRLA.bit.WMODE = NVMCTRL_CTRLA_WMODE_MAN_Val;
    waitForLast();
    unlock();
    NVMCTRL->ADDR.reg = address;
    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_EB;
    waitForLast();
    //memset(flashCopy + address - FLASH_BASE, 0xff, NVMCTRL_BLOCK_SIZE);
    lock();
    return 0;
}

static int numWR;

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
    if (NVMCTRL->INTFLAG.bit.ECCSE || NVMCTRL->INTFLAG.bit.ECCDE)
        target_panic(997);
    unsigned idx = 0;
    while (idx < len) {
        if (((uint8_t *)src)[idx] != 0xff)
            break;
        idx++;
    }
    //LOG("WR flash %d at %x+%x %x:%x", numWR++, (void *)dst, idx, ((uint8_t *)src)[idx],
    //    ((uint8_t *)src)[idx + 1]);

    //volatile uint8_t *dpp = (uint8_t *)dst;

    if (len != 16)
        target_panic(990);
    for (int i = 0; i < 2; ++i)
        if (((uint64_t*)dst)[i] != 0xffffffffffffffff &&
            ((uint64_t*)src)[i] != 0xffffffffffffffff)
            target_panic(990);

#if 0
    //if (memcmp((void *)dpp, &flashCopy[dst - FLASH_BASE], len) != 0)
    //    target_panic(993);

    for (unsigned i = 0; i < len; ++i) {
        if (((uint8_t *)src)[i] != 0xff) {
            if (dpp[i] != 0xff)
                target_panic(990);
            //flashCopy[dst - FLASH_BASE + i] = ((uint8_t *)src)[i];
        } else {
            //if (dpp[i] != flashCopy[dst - FLASH_BASE + i])
            //    target_panic(991);
            // ((uint8_t *)src)[i] = dpp[i];
        }
    }
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
        // if (v != 0xffffffff)
        *dp = v;
        dp++;
        // waitForLast();
    }

    // for (unsigned i = 0; i < len / 4; ++i)
    //    ((volatile uint32_t *)dst)[i] = ((uint32_t*)src)[i];

    // NVMCTRL->ADDR.reg = (uint32_t)dst; // not needed?
    NVMCTRL->CTRLB.reg = NVMCTRL_CTRLB_CMDEX_KEY | NVMCTRL_CTRLB_CMD_WQW;
    waitForLast();

    target_enable_irq();

    lock();

    //if (memcmp((void *)dpp, &flashCopy[dst - FLASH_BASE], len) != 0)
    //    target_panic(992);

    if (NVMCTRL->INTFLAG.bit.ECCSE || NVMCTRL->INTFLAG.bit.ECCDE)
        target_panic(996);
        
    //LOG("WOK");

    return 0;
}
} // namespace codal
#endif
