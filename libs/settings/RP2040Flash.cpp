#include "pxt.h"
#include "Flash.h"

//#define LOG DMESG
#define LOG NOLOG

#ifdef PICO_BOARD
#include "hardware/flash.h"

#define XIP_BIAS 0x10000000

namespace codal {

int ZFlash::pageSize(uintptr_t address) {
  return FLASH_SECTOR_SIZE;
}

int ZFlash::totalSize() {
#ifndef PICO_FLASH_SIZE_BYTES
  return 2*1024*1024;
#else
  return PICO_FLASH_SIZE_BYTES;
#endif
}

int ZFlash::erasePage(uintptr_t address) {
  // address should be aligned to 4096
  if (address % 4096 == 0){
    target_disable_irq();
    flash_range_erase(address - XIP_BIAS, FLASH_SECTOR_SIZE);  
    target_enable_irq();
  }
  return 0;
}

int ZFlash::writeBytes(uintptr_t dst, const void *src, uint32_t len) {
  if (len != FLASH_PAGE_SIZE || (dst & (FLASH_PAGE_SIZE - 1))) return -1;
  // should be aligned to 256
  target_disable_irq();
  flash_range_program(dst - XIP_BIAS, (const uint8_t*)src, FLASH_PAGE_SIZE);
  target_enable_irq();
  
  return 0;
}




}

#endif
