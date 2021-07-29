#include "pxt.h"
#include "Flash.h"

//#define LOG DMESG
#define LOG NOLOG

#ifdef PICO_BOARD
#include "hardware/flash.h"

namespace codal {

int ZFlash::pageSize(uintptr_t address) {
  return FLASH_PAGE_SIZE;
}

int ZFlash::totalSize() {
#ifndef PICO_FLASH_SIZE_BYTES
  return 16*1024*1024;
#else
  return PICO_FLASH_SIZE_BYTES;
#endif
}

int ZFlash::erasePage(uintptr_t address) {
  // address should be aligned to 4096
  flash_range_erase(address, FLASH_SECTOR_SIZE);
  return 0;
}

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
  // should be aligned to 256
  flash_range_program(dst, (const uint8_t*)src, len);
  return 0;
}




}

#endif
