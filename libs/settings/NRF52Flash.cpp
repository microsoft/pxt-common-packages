#include "pxt.h"
#include "Flash.h"

//#define LOG DMESG
#define LOG NOLOG

#if defined(NRF52_SERIES)
namespace codal {

#define waitForLast() while ((NRF_NVMC->READY & NVMC_READY_READY_Msk) == 0);

int ZFlash::pageSize(uintptr_t address) {
    (void)address;
#if defined(FICR_INFO_CODEPAGESIZE_CODEPAGESIZE_Msk)
    return NRF_FICR->INFO.CODEPAGESIZE;
#else
    return NRF_FICR->CODEPAGESIZE;
#endif
}

int ZFlash::totalSize() {
#if defined(FICR_INFO_CODEPAGESIZE_CODEPAGESIZE_Msk)
    return NRF_FICR->INFO.CODESIZE * pageSize(0);
#else
    return NRF_FICR->CODESIZE * pageSize(0);
#endif
}

int ZFlash::erasePage(uintptr_t address) {
    if (address & (pageSize(address) - 1))
        target_panic(DEVICE_FLASH_ERROR);

    NRF_NVMC->CONFIG = NVMC_CONFIG_WEN_Een;
    waitForLast();
    NRF_NVMC->ERASEPAGE = address;
    waitForLast();
    NRF_NVMC->CONFIG = NVMC_CONFIG_WEN_Ren;
    waitForLast();

    return 0;
}

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
    LOG("WR flash at %p len=%d", (void *)dst, len);

    if ((dst & 3) || ((uintptr_t)src & 3) || (len & 3))
        return -1;

    for (unsigned i = 0; i < len; ++i)
        if (((uint8_t *)dst)[i] != 0xff && ((uint8_t *)src)[i] != 0xff)
            return -3;

    
    volatile uint32_t *sp = (uint32_t *)src;
    volatile uint32_t *dp = (uint32_t *)dst;

    len >>= 2;

    NRF_NVMC->CONFIG = NVMC_CONFIG_WEN_Wen;
    waitForLast();

    while (len-- > 0) {
        uint32_t v = *sp++;
        if (v != 0xffffffff) {
            *dp++ = v;
            waitForLast();
        } else {
            dp++;
        }
    }
    
    NRF_NVMC->CONFIG = NVMC_CONFIG_WEN_Ren;
    waitForLast();

    LOG("WR flash OK");

    return 0;
}
} // namespace codal
#endif
