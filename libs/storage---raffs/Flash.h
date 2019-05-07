/*
The MIT License (MIT)

Copyright (c) 2017 Lancaster University.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

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
};

#ifdef STM32F4

class STM32Flash : public Flash {
    void waitForLast() {
        while ((FLASH->SR & FLASH_SR_BSY) == FLASH_SR_BSY);
    }


void unlock(void)
{
/* Clear the unlock sequence state. */
	FLASH->CR |= FLASH_CR_LOCK;

	/* Authorize the FPEC access. */
	FLASH->KEYR = FLASH_KEYR_KEY1;
	FLASH->KEYR = FLASH_KEYR_KEY2;
}
    
  public:
    virtual int pageSize(uintptr_t address) {
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

    virtual int erasePage(uintptr_t address) {
        unlock flash

        waitForLast();

        int sectNum = 2; // TODO

        FLASH->CR = FLASH_CR_PSIZE_1 | (sectNum << FLASH_CR_SNB_Pos) | FLASH_CR_SER;
	    FLASH->CR |= FLASH_CR_STRT;

        waitForLast();

        FLASH->CR = FLASH_CR_PSIZE_1;

        lock flash?
    }



	/* Enable writes to flash. */
	FLASH_CR |= FLASH_CR_PG;

	/* Program the word. */
	MMIO32(address) = data;

	/* Wait for the write to complete. */
	flash_wait_for_last_operation();

	/* Disable writes to flash. */
	FLASH_CR &= ~FLASH_CR_PG;

};
#endif

} // namespace codal

#endif
