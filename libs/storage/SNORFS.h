#ifndef CODAL_SNORFS_H
#define CODAL_SNORFS_H

#include "SPIFlash.h"

#define DEVICE_FLASH_ERROR 950

namespace codal
{
namespace snorfs
{

class File;

struct DirEntry
{
    uint32_t size;
    uint16_t flags;
    uint16_t fileID;
    char name[65];
};

// Supported flash size: 1-16MB
class FS
{
    friend class File;

    SPIFlash &flash;
    uint8_t buf[SPIFLASH_PAGE_SIZE];

    File *files;

    uint8_t *rowRemapCache;
    uint8_t numRows;
    uint8_t numMetaRows;
    uint8_t freeRow;
    volatile bool locked;

    uint32_t randomSeed;

    // this is for data pages only
    uint16_t fullPages;
    uint16_t deletedPages;
    uint16_t freePages;

    uint16_t dirptr;

    uint32_t rowAddr(uint8_t rowIdx)
    {
        if (rowIdx >= numRows)
            target_panic(DEVICE_FLASH_ERROR);
        return rowRemapCache[rowIdx] * SPIFLASH_BIG_ROW_SIZE;
    }
    uint32_t indexAddr(uint16_t ptr)
    {
        return rowAddr(ptr >> 8) + SPIFLASH_BIG_ROW_SIZE - SPIFLASH_PAGE_SIZE + (ptr & 0xff);
    }
    uint32_t pageAddr(uint16_t ptr)
    {
        // page zero is index, shouldn't be accessed through this
        if (!(ptr & 0xff))
            target_panic(DEVICE_FLASH_ERROR);
        return rowAddr(ptr >> 8) + SPIFLASH_PAGE_SIZE * (ptr & 0xff);
    }

    int firstFree(uint16_t pageIdx);
    uint16_t findFreePage(bool isData, uint16_t hint = 0);
    uint32_t random(uint32_t max);
    void feedRandom(uint32_t max);
    void mount();
    void format();
    uint16_t findMetaEntry(const char *filename);
    uint16_t createMetaPage(const char *filename);
    bool readHeaders();
    void gcCore(bool force, bool isData);
    void swapRow(int row);
    void markPage(uint16_t page, uint8_t flag);
    uint8_t dataPageSize();
    uint16_t read16(int off);
    int metaStart(uint16_t *nextPtr = NULL, uint16_t *nextPtrPtr = NULL);
    uint32_t fileSize(uint16_t metaPage);
    void lock();
    void unlock();
    bool pageErased(uint32_t addr);
    bool rowErased(uint32_t addr, bool checkFull);

public:
    FS(SPIFlash &f);
    ~FS();
    // returns NULL if file doesn't exists and create==false
    File *open(const char *filename, bool create = true);
    File *open(uint16_t fileID);
    bool exists(const char *filename);
    uint32_t rawSize() { return flash.numPages() * SPIFLASH_PAGE_SIZE; }
    uint32_t totalSize() { return (fullPages + deletedPages + freePages) * SPIFLASH_PAGE_SIZE; }
    uint32_t freeSize() { return (deletedPages + freePages) * SPIFLASH_PAGE_SIZE; }
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

class File
{
    // Invariants:
    // firstPage == 0 <==> no pages has been allocated
    // readOffset % SPIFLASH_PAGE_SIZE == 0 && readPage != 0 ==>
    //       readPage is on page for (readOffset - 1)
    // writePage % SPIFLASH_PAGE_SIZE == 0 && writePage != 0 ==>
    //       writePage is on page for (metaSize - 1)
    // if readPage is 0 it needs to be recomputed
    // if writePage is 0 it needs to be recomputed

    friend class FS;

    FS &fs;
    File *next;
    uint32_t metaSize;

    uint16_t metaPage; // the address of main meta entry

    // this is for reading
    uint16_t readMetaPage;
    uint16_t readPage;
    uint8_t readOffsetInPage;
    uint8_t readPageSize;
    uint32_t readOffset;

    // this is for writing (append)
    uint16_t writeMetaPage;
    uint16_t writePage;
    uint8_t writeOffsetInPage;
    uint8_t writeNumExplicitSizes;

    uint32_t metaPageAddr() { return fs.pageAddr(metaPage); }

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
    uint32_t fileID() { return metaPage; }
    bool isDeleted() { return writePage == 0xffff; }
    void overwrite(const void *data, uint32_t len);
    void del();
    void truncate() { overwrite(NULL, 0); }
    ~File();
#ifdef SNORFS_TEST
    void debugDump();
#endif
};
}
}

#endif
