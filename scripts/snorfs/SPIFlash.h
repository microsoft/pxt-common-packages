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

#ifndef CODAL_SPIFLASH_H
#define CODAL_SPIFLASH_H

#include "CodalDevice.h"

// this seems common to many different SPI flash parts
// they sometimes also have medium row of 32k
#define SPIFLASH_PAGE_SIZE 256
#define SPIFLASH_SMALL_ROW_PAGES 16
#define SPIFLASH_BIG_ROW_PAGES 256
#define SPIFLASH_SMALL_ROW_SIZE (SPIFLASH_SMALL_ROW_PAGES * SPIFLASH_PAGE_SIZE) // 4k
#define SPIFLASH_BIG_ROW_SIZE (SPIFLASH_BIG_ROW_PAGES * SPIFLASH_PAGE_SIZE)     // 64k

namespace codal
{
class SPIFlash
{
public:
    virtual int numPages() = 0;
    virtual int readBytes(uint32_t addr, void *buffer, uint32_t len) = 0;
    // len <= SPIFLASH_PAGE_SIZE; block cannot span pages
    virtual int writeBytes(uint32_t addr, const void *buffer, uint32_t len) = 0;
    virtual int eraseSmallRow(uint32_t addr) = 0;
    virtual int eraseBigRow(uint32_t addr) = 0;
    virtual int eraseChip() = 0;
};
}

#endif
