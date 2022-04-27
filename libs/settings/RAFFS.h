#ifndef CODAL_RAFFS_H
#define CODAL_RAFFS_H

#include "Flash.h"

namespace pxt {
namespace raffs {

struct DirEntry {
    uint32_t size;
    uint16_t flags;
    const char *name;
};

struct BlockedEntries {
    BlockedEntries *next;
    uint16_t fnptrs[32];
};

#define RAFFS_FOLLOWING_MASK 0x8000

#ifdef PICO_BOARD
#define RAFFS_FLASH_BUFFER_SIZE 256
#else
#define RAFFS_FLASH_BUFFER_SIZE 64
#endif

struct MetaEntry {
    uint16_t fnhash;    // hash of file name
    uint16_t fnptr;     // offset in bytes; can't be 0xffff
    uint16_t _datasize; // size in bytes; highest bit is set if this isn't first block
    uint16_t dataptr;   // offset in bytes; 0x0 - deleted

    uint16_t datasize() { return _datasize & 0x7fff; }
    bool isFirst() { return (_datasize & RAFFS_FOLLOWING_MASK) == 0; }
};

#define RAFFS_ROUND(x) ((((uintptr_t)(x) + 7) >> 3) << 3)

typedef bool (*filename_filter)(const char *);

class FS {
    codal::Flash &flash;

    uint8_t *basePtr, *freeDataPtr;
    MetaEntry *endPtr, *metaPtr, *readDirPtr, *cachedMeta;
    int32_t gcHorizon;
    DirEntry dirEnt;
    uintptr_t flashBufAddr;
    uint8_t flashBuf[RAFFS_FLASH_BUFFER_SIZE];
    BlockedEntries *blocked;
    volatile bool locked;

    void erasePages(uintptr_t addr, uint32_t len);
    void flushFlash();
    void writeBytes(void *dst, const void *src, uint32_t size);
    void mount();
    void lock();
    void unlock();
    MetaEntry *findMetaEntry(const char *filename);
    bool tryGC(int spaceNeeded, filename_filter filter = NULL);

    bool checkBlocked(MetaEntry *m);
    void clearBlocked();
    void oopsAndClear();

    uint16_t writeData(const void *data, uint32_t len);
    void finishWrite();
    const char *fnptr(MetaEntry *m) { return (const char *)(basePtr + m->fnptr); }

    uint32_t *altBasePtr() {
        if ((uintptr_t)basePtr == baseAddr)
            return (uint32_t *)(baseAddr + bytes / 2);
        else
            return (uint32_t *)baseAddr;
    }

  public:
    // Minimum time in ms that has to pass between two GCs; we shall panic 920 if GCs happen more often
    // (avareged over 3x this time).
    // This is usually set to around 10s (10000), so that if user writes a program that writes to flash in
    // a loop, it doesn't wear out flash completely.
    uint16_t minGCSpacing;
    uintptr_t baseAddr;
    uint32_t bytes;

    FS(codal::Flash &flash, uintptr_t baseAddr, uint32_t bytes);
    ~FS();

    // returns 0 for success, negative for error
    int write(const char *keyName, const void *data, uint32_t bytes);
    // returns total number of bytes in key's value or -1 when file doesn't exists
    // if keyName==NULL it will re-use last keyName
    int read(const char *keyName, void *data, uint32_t bytes);
    // deletes given key if it exists
    int remove(const char *keyName);

    void format();
    bool exists(const char *keyName) { return read(keyName, NULL, 0) >= 0; }
    uint32_t totalSize() { return bytes / 2; }
    uint32_t freeSize() { return (uintptr_t)endPtr - (uintptr_t)freeDataPtr; }
    void forceGC(filename_filter filter = NULL);
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
