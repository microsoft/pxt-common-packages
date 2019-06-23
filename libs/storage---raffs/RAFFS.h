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
#define FLASH_BUFFER_SIZE 16
#else
#define FLASH_BUFFER_SIZE 64
#endif

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
    uint8_t flashBuf[FLASH_BUFFER_SIZE];

    void erasePages(uintptr_t addr, uint32_t len);
    void flushFlash();
    void writeBytes(void *dst, const void *src, uint32_t size);
    void format();
    void mount();
    void lock();
    void unlock();
    MetaEntry *findMetaEntry(const char *filename);
    MetaEntry *createMetaPage(const char *filename, MetaEntry *existing);
    uint32_t getFileSize(uint16_t dataptr, uint16_t *lastptr = NULL);
    uintptr_t copyFile(uint16_t dataptr, uintptr_t dst);
    bool tryGC(int spaceNeeded);

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
    uint32_t size();
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
