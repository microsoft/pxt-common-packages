#ifndef CODAL_SNORFS_H
#define CODAL_SNORFS_H

#include "Flash.h"

#define DEVICE_FLASH_ERROR 950

#define SNORFS_PAGE_SIZE 256

namespace codal {

class Flash {};

namespace snorfs {

class File;

struct DirEntry {
    uint32_t size;
    uint16_t flags;
    const char *name;
};

class FS {
    friend class File;

    struct MetaEntry {
        uint16_t fnhash;
        uint16_t fnptr;
        uint16_t dataptr;
        uint16_t reserved;
    };

    Flash &flash;
    File *files;

    volatile bool locked;

    uint32_t *basePtr, *freeDataPtr;
    MetaEntry *endPtr, *metaPtr;
    uint32_t baseAddr, bytes;

  public:
    FS(Flash &flash, uint32_t baseAddr, uint32_t bytes);
    ~FS();
    // returns NULL if file doesn't exists and create==false
    File *open(const char *filename, bool create = true);
    bool exists(const char *filename);
    uint32_t rawSize() { return flash.numPages() * SNORFS_PAGE_SIZE; }
    uint32_t totalSize() { return (fullPages + deletedPages + freePages) * SNORFS_PAGE_SIZE; }
    uint32_t freeSize() { return (deletedPages + freePages) * SNORFS_PAGE_SIZE; }
    void busy(bool isBusy = true);
    void maybeGC();
    // this allow raw r/o access; will lock the instance as needed
    int readFlashBytes(uint32_t addr, void *buffer, uint32_t len);
    bool tryMount();

    void dirRewind() { dirptr = 0; }
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
    bool seekNextPage(uint16_t *cache);
    void allocatePage();
    void newMetaPage();
    void findFreeMetaPage();
    void computeWritePage();
    void saveSizeDiff(int32_t sizeDiff);
    void appendCore(const void *data, uint32_t len);
    void delCore(bool delMeta);
    File(FS &f, uint16_t filePage);
    File(FS &f, const char *filename);
    File *primary();

  public:
    int read(void *data, uint32_t len);
    void append(const void *data, uint32_t len);
    void seek(uint32_t pos);
    uint32_t size();
    uint32_t tell() { return readOffset; }
    bool isDeleted() { return writePage == 0xffff; }
    void overwrite(const void *data, uint32_t len);
    void del();
    void truncate() { overwrite(NULL, 0); }
    ~File();
#ifdef SNORFS_TEST
    void debugDump();
#endif
};
} // namespace snorfs
} // namespace codal

#endif
