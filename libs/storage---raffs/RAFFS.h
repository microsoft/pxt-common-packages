#ifndef CODAL_RAFFS_H
#define CODAL_RAFFS_H

#include "Flash.h"

#define DEVICE_FLASH_ERROR 950

namespace pxt {
namespace raffs {

class File;

struct DirEntry {
    uint32_t size;
    uint16_t flags;
    const char *name;
};

struct MetaEntry {
    uint16_t fnhash;  // hash of file name
    uint16_t fnptr;   // offset in words; can't be 0xffff
    uint16_t flags;   // can't be 0xffff - to avoid M1 word
    uint16_t dataptr; // offset in words; 0xffff - empty file
};

#ifdef SAMD51
#define RAFFS_FLASH_BUFFER_SIZE 16
// RAFFS64 only writes each 64 bit double word once; needed for SAMD51 ECC flash
#define RAFFS_BLOCK 64
#define RAFFS_DELETED 0x7ffe
#define RAFFS_ROUND(x) (((x) + 7) >> 3) << 3
#else
#define RAFFS_FLASH_BUFFER_SIZE 64
#define RAFFS_BLOCK 16
#define RAFFS_ROUND(x) (((x) + 3) >> 2) << 2
#endif

#define RAFFS_VALIDATE_NEXT(nextptr)                                                               \
    if (nextptr == 0 || nextptr > bytes / 8)                                                       \
    target_panic(DEVICE_FLASH_ERROR)

class FS {
    friend class File;

    codal::Flash &flash;
    File *files;

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

    uint16_t _rawsize(uint16_t dp) {
        RAFFS_VALIDATE_NEXT(dp);
        return basePtr[dp] & 0xffff;
    }

    uint16_t _size(uint16_t dp) {
        uint16_t blsz = _rawsize(dp);
#if RAFFS_BLOCK == 64
        if (blsz == RAFFS_DELETED)
            return 0;
        return blsz & 0x7fff;
#endif
        return blsz;
    }

    uint16_t _nextptr(uint16_t dp) {
        RAFFS_VALIDATE_NEXT(dp);
        return basePtr[dp] >> 16;
    }

    uint16_t blnext(uint16_t dp) {
        uint16_t np = _nextptr(dp);
        if (np == 0xffff)
            return 0;
#if RAFFS_BLOCK == 64
        int blsz = _size(dp);
        np += RAFFS_ROUND(blsz - 4) >> 2;
#endif
        return np;
    }

    int blsize(uint16_t dp) {
#if RAFFS_BLOCK == 64
        if (blnext(dp) && (_rawsize(blnext(dp)) & 0x8000) == 0)
            return 0;
        if (_rawsize(dp) == RAFFS_DELETED)
            return -1;
        return _size(dp);
#else
        return _size(dp);
#endif
    }

    uint32_t *data0(uint16_t dp) { return &basePtr[dp] + 1; }

    uint32_t *data1(uint16_t dp) {
#if RAFFS_BLOCK == 64
        RAFFS_VALIDATE_NEXT(_nextptr(dp));
        return &basePtr[_nextptr(dp)]
#else
        return &basePtr[dp] + 2;
#endif
    }

  public:
    FS(codal::Flash &flash, uintptr_t baseAddr, uint32_t bytes);
    ~FS();
    // returns NULL if file doesn't exists and create==false or when there's no space to create it
    File *open(const char *filename, bool create = true);
    bool exists(const char *filename);
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

#ifdef SNORFS_TEST
    void debugDump();
    void dump();
#else
    void debugDump() {}
#endif
};

class File {
    friend class FS;

    FS &fs;
    File *next;

    MetaEntry *meta;

    // reading
    uint16_t readPage;
    uint16_t readOffset;
    uint16_t readOffsetInPage;

    // for writing
    uint16_t lastPage;

    void rewind();
    File(FS &f, MetaEntry *existing);
    File *primary();
    void resetAllCaches();
    void resetCaches() {
        lastPage = 0;
        readPage = 0;
        readOffsetInPage = 0;
    }

  public:
    int read(void *data, uint32_t len);
    void seek(uint32_t pos);
    int32_t size();
    uint32_t tell() { return readOffset; }
    bool isDeleted() { return meta->dataptr == 0; }
    // thse two return negative value when out of space
    int append(const void *data, uint32_t len);
    int overwrite(const void *data, uint32_t len);
    void del();
    void truncate() { overwrite(NULL, 0); }
    ~File();
#ifdef SNORFS_TEST
    void debugDump();
#endif
};
} // namespace raffs
} // namespace pxt

#endif
