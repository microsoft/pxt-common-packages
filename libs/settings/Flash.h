#ifndef CODAL_FLASH_H
#define CODAL_FLASH_H

#include "CodalDevice.h"

namespace codal {
class Flash {
  public:
    /**
     * Return page size in bytes at given address (doesn't have to be page-aligned).
     */
    virtual int pageSize(uintptr_t address) = 0;

    /**
     * Erase page at given page-aligned address.
     */
    virtual int erasePage(uintptr_t address) = 0;

    /**
     * Write given number of bytes within one page. Flash has to be erased first.
     */
    virtual int writeBytes(uintptr_t dst, const void *src, uint32_t len) = 0;

    /**
     * Return the total size of flash.
     */
    virtual int totalSize();
};

class ZFlash : public Flash {
  public:
    virtual int pageSize(uintptr_t address);
    virtual int totalSize();
    virtual int erasePage(uintptr_t address);
    virtual int writeBytes(uintptr_t dst, const void *src, uint32_t len);
};

#define CODAL_FLASH codal::ZFlash
#define DEVICE_FLASH_ERROR 922


} // namespace codal

#endif
