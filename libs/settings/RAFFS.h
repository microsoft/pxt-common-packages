#ifndef CODAL_RAFFS_H
#define CODAL_RAFFS_H

#include "Flash.h"

#define DEVICE_FLASH_ERROR 950

namespace pxt {
namespace raffs {

struct DirEntry {
    uint32_t size;
    uint16_t flags;
    const char *name;
};

#define RAFFS_FOLLOWING_MASK 0x8000

struct MetaEntry {
    uint16_t fnhash;   // hash of file name
    uint16_t fnptr;    // offset in bytes; can't be 0xffff
    uint16_t _datasize; // size in bytes; highest bit is set if this isn't first block
    uint16_t dataptr;  // offset in bytes; 0x0 - deleted

    uint16_t datasize() { return _datasize & 0x7fff; }
    bool isFirst() { return (_datasize & RAFFS_FOLLOWING_MASK) == 0; }
};

#define RAFFS_ROUND(x) ((((uintptr_t)(x) + 7) >> 3) << 3)

class FS {
    codal::Flash &flash;

    volatile bool locked;

    uint32_t *basePtr, *freeDataPtr;
    MetaEntry *endPtr, *metaPtr, *readDirPtr;
    uintptr_t baseAddr;
    uint32_t bytes;
    DirEntry dirEnt;
    uintptr_t flashBufAddr;
    uint8_t flashBuf[RAFFS_FLASH_BUFFER_SIZE];

    void erasePages(uintptr_t addr, uint32_t len);
    void flushFlash();
    void writeBytes(void *dst, const void *src, uint32_t size);
    void format();
    void mount();
    void lock();
    void unlock();
    MetaEntry *findMetaEntry(const char *filename);
    MetaEntry *createMetaPage(const char *filename, MetaEntry *existing);
    int32_t getFileSize(uint16_t dataptr, uint16_t *lastptr = NULL);
    uintptr_t copyFile(uint16_t dataptr, uintptr_t dst);
    bool tryGC(int spaceNeeded);

    uint32_t *markEnd(uint32_t *freePtr);
    void writePadded(const void *data, uint32_t len);
    uint16_t findBeginning(uint16_t dataptr);

    uint32_t *altBasePtr() {
        if ((uintptr_t)basePtr == baseAddr)
            return (uint32_t *)(baseAddr + bytes / 2);
        else
            return (uint32_t *)baseAddr;
    }

    uint8_t *dataptr(MetaEntry *m) { return (uint8_t*)basePtr + m->dataptr; }
    uint8_t *fnptr(MetaEntry *m) { return (uint8_t*)basePtr + m->fnptr; }

  public:
    FS(codal::Flash &flash, uintptr_t baseAddr, uint32_t bytes);
    ~FS();

    // returns 0 for success, negative for error
    int write(const char *keyName, const uint8_t *data, uint32_t bytes);
    // returns total number of bytes in key's value or -1 when file doesn't exists
    // if keyName==NULL it will re-use last keyName
    int read(const char *keyName, uint8_t *data, uint32_t bytes);
    // deletes given key if it exists
    int remove(const char *keyName);



    bool exists(const char *keyName) { return read(keyName, NULL, 0) >= 0; }
    uint32_t rawSize() { return bytes / 2; }
    uint32_t totalSize() { return bytes / 2; }
    uint32_t freeSize() { return (uintptr_t)endPtr - (uintptr_t)freeDataPtr; }
    void busy(bool isBusy = true);
    void forceGC();
    // this allow raw r/o access; will lock the instance as needed
    int readFlashBytes(uintptr_t addr, void *buffer, uint32_t len);
    bool tryMount();

    void dirRewind() { readDirPtr = NULL; }
    DirEntry *dirRead(); // data is only valid until next call to to any of File or FS function

#ifdef RAFFS_TEST
    void debugDump();
    void dump();
#else
    void debugDump() {}
#endif
};

} // namespace raffs
} // namespace pxt

#endif
