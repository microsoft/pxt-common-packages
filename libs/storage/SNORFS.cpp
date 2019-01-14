#include "SNORFS.h"
#include "CodalDmesg.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include <stddef.h>

#define oops() target_panic(DEVICE_FLASH_ERROR)

#ifndef SNORFS_TEST
#define LOG DMESG
#define LOGV(...)                                                                                  \
    do {                                                                                           \
    } while (0)
#endif

using namespace codal::snorfs;

static uint16_t snorfs_unlocked_event;

#define SNORFS_LEVELING_THRESHOLD 100

// The values below were picked at random
#define SNORFS_MAGIC 0x3576348e
#define SNORFS_FREE_FLAG 0xd09ff063
#define SNORFS_COPIED_FLAG 0x4601c6dc
#define SNORFS_COMPUTING_WRITE_PAGE 0x00ff
#define SNORFS_TRY_MOUNT 0xfff0

struct BlockHeader {
    uint32_t magic;
    uint8_t version;
    uint8_t numMetaRows;
    uint16_t logicalBlockId;
    uint32_t eraseCount;
    uint32_t freeFlag;
    uint32_t copiedFlag;
};

static uint8_t fnhash(const char *fn) {
    uint32_t h = 0x811c9dc5;
    while (*fn)
        h = (h * 0x1000193) ^ (uint8_t)*fn++;
    h &= 0xff;
    if (h <= 0x02 || h == 0xff)
        return h + 0xf0;
    return h;
}

FS::FS(SPIFlash &f, uint32_t rowSize) : flash(f) {
    numRows = 0;
    randomSeed = 1;
    dirptr = 0;
    files = NULL;
    locked = false;
    this->rowSize = rowSize;
    pagesPerRow = rowSize / SNORFS_PAGE_SIZE;

    if (pagesPerRow * SNORFS_PAGE_SIZE != rowSize || pagesPerRow > SNORFS_PAGE_SIZE)
        oops();

    if (!snorfs_unlocked_event)
        snorfs_unlocked_event = codal::allocateNotifyEvent();
}

void FS::feedRandom(uint32_t v) {
    randomSeed ^= (v + 1) * 0x1000193;
}

// we need a deterministic PRNG - this one has period of 2^32
uint32_t FS::random(uint32_t max) {
    uint32_t mask = 1;
    while (mask <= max)
        mask = (mask << 1) | 1;
    while (true) {
        randomSeed = randomSeed * 1664525 + 1013904223;
        auto v = randomSeed & mask;
        if (v < max)
            return v;
    }
}

int FS::firstFree(uint16_t pageIdx) {
    flash.readBytes(indexAddr(pageIdx), buf, pagesPerRow);
    for (int k = 1; k < pagesPerRow - 1; ++k)
        if (buf[k] == 0xff)
            return pageIdx | k;
    return 0;
}

void FS::busy(bool) {
    // blink LED or something
}

static void initBlockHeader(BlockHeader &hd, bool free) {
    hd.magic = SNORFS_MAGIC;
    hd.version = 0;
    hd.numMetaRows = 2;
    hd.eraseCount = 0;
    if (free) {
        hd.logicalBlockId = 0xffff;
        hd.freeFlag = SNORFS_FREE_FLAG;
        hd.copiedFlag = 0xffffffff;
    } else {
        hd.freeFlag = 0;
        hd.copiedFlag = SNORFS_COPIED_FLAG;
    }
}

bool FS::pageErased(uint32_t addr) {
    flash.readBytes(addr, buf, SNORFS_PAGE_SIZE);
    for (int i = 0; i < SNORFS_PAGE_SIZE; ++i)
        if (buf[i] != 0xff)
            return false;
    return true;
}

bool FS::rowErased(uint32_t addr, bool checkFull) {
    if (!checkFull)
        return pageErased(addr) && pageErased(addr + 512) && pageErased(addr + 1024);

    for (uint32_t off = 0; off < rowSize; off += SNORFS_PAGE_SIZE) {
        if (!pageErased(addr + off))
            return false;
    }
    return true;
}

void FS::format() {
    if (files)
        oops();

    uint32_t end = flash.numPages() * SNORFS_PAGE_SIZE;
    uint16_t rowIdx = 0;
    BlockHeader hd;
    initBlockHeader(hd, false);
    bool didErase = false;

    for (uint32_t addr = 0; addr < end; addr += rowSize) {
        busy();
        // in case we didn't need to do any erase yet, do a quick "likely" erasure test
        if (dirptr != SNORFS_TRY_MOUNT && !rowErased(addr, didErase)) {
            didErase = true;
            flash.eraseBigRow(addr);
            busy();
        }

        // the last empty row?
        if (addr + rowSize >= end) {
            initBlockHeader(hd, true);
        } else {
            hd.logicalBlockId = rowIdx;
        }
        LOGV("format: %d\n", rowIdx);
        flash.writeBytes(addr, &hd, sizeof(hd));
        rowIdx++;
    }
    busy(false);
}

void FS::gcCore(bool force, bool isData) {
    if (!force) {
        fullPages = 0;
        deletedPages = 0;
        freePages = 0;
    }

    uint16_t start = 0;
    uint16_t end = numRows;

    // in 'force' mode we're interested in specifically data or meta space
    if (force) {
        if (isData)
            start = numMetaRows;
        else
            end = numMetaRows;
    }

    uint32_t maxDelCnt = 0;
    uint32_t maxDelIdx = 0;

    for (unsigned row = start; row < end; ++row) {
        uint32_t addr = indexAddr(row << 8);
        flash.readBytes(addr, buf, pagesPerRow);
        uint16_t numDel = 0;
        for (int i = 1; i < pagesPerRow - 1; i++) {
            if (buf[i] == 0x00)
                numDel++;
            if (!force) {
                if (buf[i] == 0x00)
                    deletedPages++;
                else if (buf[i] == 0xff)
                    freePages++;
                else
                    fullPages++;
            }
        }

        LOGV("GC: row=%d del=%d\n", row, numDel);

        if (numDel > maxDelCnt) {
            maxDelCnt = numDel;
            maxDelIdx = row;
        }
    }

    if (force && !maxDelCnt) {
        if (isData)
            LOG("out of data space\n");
        else
            LOG("out of meta space\n");
        oops(); // really out of space!
    }

    LOGV("GC: ");

    // we do a GC when either one is true:
    //   * force is true (we desperately need space)
    //   * there's a row that's more than 50% deleted
    //   * clearing a row will increase free space by more than 20%
    if (force || maxDelCnt > pagesPerRow / 2 || (maxDelCnt * 5 > freePages)) {
        swapRow(rowRemapCache[maxDelIdx]);
        if (!readHeaders()) // this will trigger levelling on the new free block
            oops();         // but it should never fail
    }

    debugDump();
}

void FS::swapRow(int row) {
    busy();
    LOGV("[swap row: %d] ", row);
    if (freeRow == row || row > numRows)
        oops();
    uint32_t trg = freeRow * rowSize;
    uint32_t src = row * rowSize;

    uint32_t skipmask[(pagesPerRow + 31) / 32];
    memset(skipmask, 0, sizeof(skipmask));
    auto idxOff = rowSize - pagesPerRow;
    flash.readBytes(src + idxOff, buf, pagesPerRow);
    for (int i = 1; i < pagesPerRow - 1; i++) {
        if (buf[i] == 0x00) {
            skipmask[i / 32] |= 1U << (i % 32);
            buf[i] = 0xff;
            deletedPages--;
            freePages++;
        }
    }

#define setFlag(trg, flag, v)                                                                      \
    {                                                                                              \
        uint32_t flag = v;                                                                         \
        flash.writeBytes(trg + offsetof(BlockHeader, flag), &flag, sizeof(flag));                  \
    }

    setFlag(trg, freeFlag, 0); // no longer free

    flash.writeBytes(trg + idxOff, buf, pagesPerRow);
    for (int i = 1; i < pagesPerRow - 1; ++i) {
        if (skipmask[i / 32] & (1U << (i % 32)))
            continue;

        flash.readBytes(src + SNORFS_PAGE_SIZE * i, buf, SNORFS_PAGE_SIZE);
        flash.writeBytes(trg + SNORFS_PAGE_SIZE * i, buf, SNORFS_PAGE_SIZE);
        busy();
    }

    flash.readBytes(src, buf, SNORFS_PAGE_SIZE);
    auto hd = (BlockHeader *)(void *)buf;
    flash.writeBytes(trg + offsetof(BlockHeader, logicalBlockId), &hd->logicalBlockId, 2);
    setFlag(trg, copiedFlag, SNORFS_COPIED_FLAG);
    setFlag(src, copiedFlag, 0);

    hd->logicalBlockId = 0xffff;
    hd->eraseCount++;
    hd->freeFlag = 0xffffffff;
    hd->copiedFlag = 0xffffffff;
    flash.eraseBigRow(src);
    busy();
    int last = 0;
    for (int i = 0; i < SNORFS_PAGE_SIZE; ++i)
        if (buf[i] != 0xff)
            last = i;
    flash.writeBytes(src, buf, last + 1);
    // everything done, mark as fully OK free row
    setFlag(src, freeFlag, SNORFS_FREE_FLAG);

    for (int i = 0; i < numRows; ++i) {
        if (rowRemapCache[i] == row)
            rowRemapCache[i] = freeRow;
    }
    freeRow = row; // new free row
    busy(false);
}

bool FS::readHeaders() {
    memset(rowRemapCache, 0xff, numRows);

    BlockHeader hd;
    int freeRow = -1;
    bool freeDirty = false;
    bool freeRandom = false;

    int minEraseIdx = -1;
    uint32_t minEraseCnt = 0;
    uint32_t freeEraseCnt = 0;
    uint32_t totalEraseCount = 0;

    for (unsigned i = 0; i < (unsigned)numRows + 1; ++i) {
        auto addr = i * rowSize;
        flash.readBytes(addr, &hd, sizeof(hd));
        if (hd.magic != SNORFS_MAGIC || hd.version != 0) {
            // likely, we got a power failure during row erase - it now contains random data
            if (freeRow == -1) {
                freeDirty = true;
                freeRandom = true;
                freeRow = i;
                continue;
            }
            return false;
        }

        numMetaRows = hd.numMetaRows;

        totalEraseCount += hd.eraseCount;

        if (hd.logicalBlockId == 0xffff || hd.copiedFlag != SNORFS_COPIED_FLAG)
            goto isFree;
        else {
            if (hd.logicalBlockId >= numRows)
                return false;
            // if this is the first duplicate, it is liekly a duplicate left over from unfinished
            // swapRow
            if (rowRemapCache[hd.logicalBlockId] != 0xff)
                goto isFree;
            rowRemapCache[hd.logicalBlockId] = i;
            if (minEraseIdx < 0 || hd.eraseCount < minEraseCnt) {
                minEraseCnt = hd.eraseCount;
                minEraseIdx = i;
            }
        }
        continue;

    isFree:
        if (freeRow == -1) {
            freeRow = i;
            if (hd.freeFlag != SNORFS_FREE_FLAG)
                freeDirty = true;
        } else
            return false;
        freeEraseCnt = hd.eraseCount;
    }

    feedRandom(totalEraseCount);

    this->freeRow = freeRow;

    if (freeRow == -1 || !numMetaRows || numMetaRows > numRows / 2)
        return false;

    if (freeDirty) {
        LOG("fixing free row: %d\n", freeRow);
        busy();
        initBlockHeader(hd, true);
        hd.eraseCount = freeRandom ? totalEraseCount / numRows : freeEraseCnt;
        flash.eraseBigRow(freeRow * rowSize);
        busy();
        flash.writeBytes(freeRow * rowSize, &hd, sizeof(hd));
        busy(false);
    } else if (minEraseCnt + SNORFS_LEVELING_THRESHOLD < freeEraseCnt) {
        swapRow(minEraseIdx);
        LOGV(" for level\n");
    } else {
        LOGV("[no level swap: free %d, min %d]", freeEraseCnt, minEraseCnt);
    }

    return true;
}

bool FS::tryMount() {
    if (numRows == 0) {
        // we abuse dirptr as a flag
        dirptr = SNORFS_TRY_MOUNT;
        lock();
        unlock();
        dirptr = 0;
    }
    return numRows > 0;
}

void FS::mount() {
    if (numRows > 0)
        return;

    numRows = (flash.numPages() * SNORFS_PAGE_SIZE / rowSize) - 1;
    rowRemapCache = new uint8_t[numRows];

    if (!readHeaders()) {
        if (dirptr == SNORFS_TRY_MOUNT) {
            uint32_t end = flash.numPages() * SNORFS_PAGE_SIZE;
            for (uint32_t addr = 0; addr < end; addr += rowSize) {
                if (!rowErased(addr, false)) {
                    numRows = 0;
                    delete rowRemapCache;
                    rowRemapCache = NULL;
                    return;
                }
            }
        }

        format();
        if (!readHeaders())
            oops();
    }
    gcCore(false, false);
}

uint16_t FS::findFreePage(bool isData, uint16_t hint) {
    bool wrapped = false;
    bool gc = false;
    uint16_t start = isData ? numMetaRows : 0;
    uint16_t end = isData ? numRows : numMetaRows;
    uint16_t ptr = random(end - start) + start;

    uint16_t fr;

    if (hint != 0) {
        fr = firstFree(hint & 0xff00);
        if (fr)
            return fr;
    }

    for (;;) {
        fr = firstFree(ptr << 8);
        if (fr)
            return fr;
        if (++ptr == end) {
            if (wrapped) {
                if (gc)
                    oops();
                gcCore(true, isData);
                gc = true;
            }
            ptr = start;
            wrapped = true;
        }
    }
}

FS::~FS() {
    delete rowRemapCache;
}

void FS::markPage(uint16_t page, uint8_t flag) {
    if (flag == 0xff)
        oops();
    if (flag == 0) {
        deletedPages++;
        fullPages--;
    } else {
        fullPages++;
        freePages--;
    }

    if (flag == 0 && (page >> 8) < numMetaRows) {
        flash.writeBytes(pageAddr(page), &flag, 1);
    }
    flash.writeBytes(indexAddr(page), &flag, 1);
}

uint8_t FS::dataPageSize() {
    int markedLen = 0;
    int i;
    for (i = SNORFS_PAGE_SIZE - 1; i >= 0; --i) {
        if (buf[i] == 0xff)
            break;
        markedLen = buf[i];
    }
    while (i >= 0) {
        if (buf[i] != 0xff)
            break;
        i--;
    }
    i++;
    return max(i, markedLen);
}

void File::rewind() {
    readPage = 0;
    readMetaPage = 0;
    readOffset = 0;
    readOffsetInPage = 0;
    readPageSize = 0;
}

File *FS::open(uint16_t fileID) {
    lock();
    auto r = new File(*this, fileID);
    unlock();
    return r;
}

File *FS::open(const char *filename, bool create) {
    lock();
    auto page = findMetaEntry(filename);
    if (page == 0) {
        if (create)
            page = createMetaPage(filename);
        else
            return NULL;
    }
    auto r = new File(*this, page);
    unlock();
    return r;
}

bool FS::exists(const char *filename) {
    lock();
    auto r = findMetaEntry(filename) != 0;
    unlock();
    return r;
}

void FS::lock() {
    while (locked)
        fiber_wait_for_event(DEVICE_ID_NOTIFY, snorfs_unlocked_event);
    locked = true;
    mount();
}

void FS::unlock() {
    if (!locked)
        oops();
    locked = false;
#ifndef SNORFS_TEST
    Event(DEVICE_ID_NOTIFY, snorfs_unlocked_event);
#endif
}

void FS::maybeGC() {
    lock();
    gcCore(false, false);
    unlock();
}

uint16_t FS::findMetaEntry(const char *filename) {
    uint8_t h = fnhash(filename);
    uint16_t buflen = strlen(filename) + 2;

    if (buflen > 64)
        oops();

    for (int i = 0; i < numMetaRows; ++i) {
        flash.readBytes(indexAddr(i << 8), buf, pagesPerRow);
        for (int j = 1; j < pagesPerRow - 1; ++j) {
            if (buf[j] == h) {
                uint8_t tmp[buflen];
                uint16_t pageIdx = (i << 8) | j;
                auto addr = pageAddr(pageIdx);
                flash.readBytes(addr, tmp, buflen);
                if (tmp[0] == 1 && memcmp(tmp + 1, filename, buflen - 1) == 0)
                    return pageIdx;
            }
        }
    }

    return 0;
}

uint16_t FS::createMetaPage(const char *filename) {
    uint8_t h = fnhash(filename);
    feedRandom(h);
    uint16_t page = findFreePage(false);
    uint16_t buflen = strlen(filename) + 2;

    memset(buf, 0xff, SNORFS_PAGE_SIZE);
    buf[0] = 0x01;
    memcpy(buf + 1, filename, buflen - 1);

    flash.writeBytes(pageAddr(page), buf, buflen);
    markPage(page, h);

    return page;
}

File::File(FS &f, uint16_t existing) : fs(f) {
    metaPage = existing;
    writePage = 0;
    rewind();
    next = fs.files;
    fs.files = this;
}

File::~File() {
    if (this == fs.files) {
        fs.files = next;
    } else {
        auto p = fs.files;
        while (p) {
            if (p->next == this) {
                p->next = this->next;
                break;
            }
            p = p->next;
        }
        if (p == NULL)
            oops();
    }
}

void File::seek(uint32_t pos) {
    if (pos == readOffset)
        return;
    if (pos < readOffset)
        rewind();
    read(NULL, pos - readOffset);
}

int FS::metaStart(uint16_t *nextPtr, uint16_t *nextPtrPtr) {
    int start = 1;
    while (start < 64 && buf[start])
        start++;
    start++;
    if (nextPtr)
        *nextPtr = read16(start);
    if (nextPtrPtr)
        *nextPtrPtr = start;
    start += 2;
    for (int i = start; i + 2 < SNORFS_PAGE_SIZE; i += 3)
        if (buf[i] == 0x00 && buf[i + 1] == 0x00 && buf[i + 2] == 0x00)
            start = i + 3;
    return start;
}

uint32_t FS::fileSize(uint16_t metaPage) {
    uint32_t sz = 0;
    uint16_t lastPage = 0;
    uint16_t currPage = metaPage;
    for (;;) {
        flash.readBytes(pageAddr(currPage), buf, SNORFS_PAGE_SIZE);
        if (buf[0] == 0x00)
            return 0; // deleted
        uint16_t nextPtr;
        for (int i = metaStart(&nextPtr); i + 2 < SNORFS_PAGE_SIZE; i += 3) {
            uint16_t page = read16(i);
            if (page == 0xffff) {
                if (nextPtr != 0xffff)
                    oops();
                break;
            }
            if (buf[i + 2] == 0xff) {
                lastPage = page;
            } else {
                sz += buf[i + 2] + 1;
                if (lastPage)
                    oops();
            }
        }
        if (nextPtr == 0xffff)
            break;

        if (lastPage)
            oops();
        currPage = nextPtr;
    }

    if (lastPage) {
        flash.readBytes(pageAddr(lastPage), buf, SNORFS_PAGE_SIZE);
        sz += dataPageSize();
    }

    if (lastPage || currPage != metaPage) {
        flash.readBytes(pageAddr(metaPage), buf, 64);
    }

    return sz;
}

uint16_t FS::read16(int off) {
    return buf[off] | (buf[off + 1] << 8);
}

#define DIRCHUNK 32
DirEntry *FS::dirRead() {
    lock();
    for (;;) {
        if ((dirptr >> 8) >= numMetaRows) {
            unlock();
            return NULL;
        }
        int off = dirptr & 0xff;
        int len = min(DIRCHUNK, pagesPerRow - off);
        flash.readBytes(indexAddr(dirptr), buf, len);
        for (int i = 0; i < len; ++i) {
            if (i + off >= 0x100)
                oops();
            if (0x02 < buf[i] && buf[i] < 0xff) {
                dirptr += i;
                DirEntry tmp;
                tmp.flags = 0;
                tmp.fileID = dirptr;
                tmp.size = fileSize(dirptr);
                dirptr++;
                if (buf[0] == 0x01) {
                    strcpy(tmp.name, (char *)buf + 1);
                    memcpy(buf, &tmp, sizeof(tmp));
                    unlock();
                    return (DirEntry *)(void *)buf;
                }
            }
        }
        dirptr += len;
        if ((dirptr & 0xff) == pagesPerRow) {
            dirptr &= ~0xff;
            dirptr += 0x100;
        }
    }
}

bool File::seekNextPage(uint16_t *cache) {
    if (readMetaPage == 0)
        readMetaPage = metaPage;

    if (*cache != readMetaPage) {
        fs.flash.readBytes(fs.pageAddr(readMetaPage), fs.buf, SNORFS_PAGE_SIZE);
        *cache = readMetaPage;
    }

    uint16_t nextPtr;
    bool isNext = false;
    uint16_t newReadPage = 0;

    for (int i = fs.metaStart(&nextPtr); i + 2 < SNORFS_PAGE_SIZE; i += 3) {
        uint16_t page = fs.read16(i);
        if (page == 0xffff)
            return false;
        if (isNext || readPage == 0) {
            newReadPage = page;
            readPageSize = fs.buf[i + 2];
            break;
        }
        if (page == readPage)
            isNext = true;
    }

    if (newReadPage == 0) {
        if (!isNext)
            oops();
        if (nextPtr == 0xffff)
            return false;
        readMetaPage = nextPtr;
        readPage = 0;
        return seekNextPage(cache);
    }

    if (readPageSize == 0xff) {
        *cache = 0;
        fs.flash.readBytes(fs.pageAddr(newReadPage), fs.buf, SNORFS_PAGE_SIZE);
        readPageSize = fs.dataPageSize();
    } else
        readPageSize++;

    readPage = newReadPage;
    readOffsetInPage = 0;
    return true;
}

uint32_t File::size() {
    primary()->computeWritePage();
    return metaSize;
}

File *File::primary() {
    for (auto p = fs.files; p; p = p->next)
        if (p->metaPage == metaPage)
            return p;
    oops();
    return NULL;
}

int File::read(void *data, uint32_t len) {
    if (!len)
        return 0;

    if (writePage != SNORFS_COMPUTING_WRITE_PAGE)
        fs.lock();

    if (len > 0x7fffffffU)
        len = 0x7fffffffU;

    uint16_t seekCache = 0;
    int nread = 0;
    while (len > 0) {
        if (readOffsetInPage >= readPageSize) {
            if (!seekNextPage(&seekCache))
                break;
        }

        int n = min((int)len, readPageSize - readOffsetInPage);
        if (data) {
            fs.flash.readBytes(fs.pageAddr(readPage) + readOffsetInPage, data, n);
            data = (uint8_t *)data + n;
        }
        nread += n;
        len -= n;
        readOffset += n;
        readOffsetInPage += n;
    }

    if (writePage != SNORFS_COMPUTING_WRITE_PAGE)
        fs.unlock();

    return nread;
}

void File::computeWritePage() {
    if (isDeleted())
        oops();
    if (writePage)
        return;
    auto prevOff = readOffset;
    writePage = SNORFS_COMPUTING_WRITE_PAGE;
    seek(0xffffffff);
    auto newWritePage = readPage;
    writeMetaPage = readMetaPage;
    writeOffsetInPage = readOffsetInPage;
    writeNumExplicitSizes = 0;
    if (newWritePage) {
        fs.flash.readBytes(fs.pageAddr(newWritePage), fs.buf, SNORFS_PAGE_SIZE);
        for (int i = SNORFS_PAGE_SIZE - 1; i >= 0; --i) {
            if (fs.buf[i] == 0xff)
                break;
            writeNumExplicitSizes++;
        }
    }
    for (auto p = fs.files; p; p = p->next)
        if (p->metaPage == metaPage)
            p->metaSize = readOffset;
    seek(prevOff);
    writePage = newWritePage;
}

void File::append(const void *data, uint32_t len) {
    if (len == 0)
        return;

    auto prim = primary();
    if (prim != this) {
        prim->append(data, len);
        return;
    }

    fs.lock();

    computeWritePage();

    while (len > 0) {
        int nwrite =
            min((int)len, SNORFS_PAGE_SIZE - (writeNumExplicitSizes + 2) - writeOffsetInPage);
        if (nwrite <= 0 || writePage == 0) {
            allocatePage();
            continue;
        }

        LOGV("write: left=%d page=0x%x nwr=%d off=%d\n", len, writePage, nwrite, writeOffsetInPage);

        fs.flash.writeBytes(fs.pageAddr(writePage) + writeOffsetInPage, data, nwrite);

        writeOffsetInPage += nwrite;

        // if the last byte was 0xff, we need an end marker
        if (((uint8_t *)data)[nwrite - 1] == 0xff) {
            fs.flash.writeBytes(fs.pageAddr(writePage) + SNORFS_PAGE_SIZE -
                                    (writeNumExplicitSizes++ + 1),
                                &writeOffsetInPage, 1);
        }

        len -= nwrite;
        data = (uint8_t *)data + nwrite;

        for (auto p = fs.files; p; p = p->next)
            if (p->metaPage == metaPage) {
                if (writePage == p->readPage)
                    p->readPageSize = writeOffsetInPage;
                p->metaSize += nwrite;
            }
    }

    fs.unlock();
}

void File::allocatePage() {
    fs.feedRandom(fileID());

    fs.flash.readBytes(fs.pageAddr(writeMetaPage), fs.buf, SNORFS_PAGE_SIZE);
    int next = 0;
    int last = 0;
    uint16_t nextPP;
    for (int i = fs.metaStart(NULL, &nextPP); i + 2 < SNORFS_PAGE_SIZE; i += 3) {
        if (fs.buf[i] == 0xff && fs.buf[i + 1] == 0xff) {
            next = i;
            break;
        }
        last = i;
    }

    if (last && fs.buf[last + 2] != 0xff)
        oops();

    if (writePage && last) {
#ifdef SNORFS_TEST
        fs.flash.readBytes(fs.pageAddr(writePage), fs.buf, SNORFS_PAGE_SIZE);
        uint8_t len = fs.dataPageSize();
        if (len != writeOffsetInPage)
            oops();
#endif
        uint8_t v = writeOffsetInPage - 1;
        fs.flash.writeBytes(fs.pageAddr(writeMetaPage) + last + 2, &v, 1);
    }

    if (!next) {
        uint16_t newMeta = fs.findFreePage(false);
        fs.markPage(newMeta, 0x02);
        uint8_t hd[] = {0x02, 0x00};
        fs.flash.writeBytes(fs.pageAddr(newMeta), hd, 2);
        fs.flash.writeBytes(fs.pageAddr(writeMetaPage) + nextPP, &newMeta, 2);
        writeMetaPage = newMeta;
        next = 4;
    }

    // if writePage is set, try to keep the new page on the same row - this helps with
    // delete locality
    writePage = fs.findFreePage(true, writePage);
    fs.markPage(writePage, 1);
    fs.flash.writeBytes(fs.pageAddr(writeMetaPage) + next, &writePage, 2);
    writeOffsetInPage = 0;
    writeNumExplicitSizes = 0;
}

void File::delCore(bool delMeta) {
    rewind();
    uint16_t cache = 0;
    uint16_t prev = 0;
    bool empty = true;

    for (;;) {
        if (!seekNextPage(&cache))
            break;
        empty = false;
        if (readMetaPage != prev) {
            if (delMeta)
                fs.markPage(readMetaPage, 0);
            prev = readMetaPage;
        }
        fs.markPage(readPage, 0);
    }

    if (delMeta && empty) {
        fs.markPage(metaPage, 0);
    }

    if (!delMeta && readMetaPage != metaPage)
        oops();

    for (auto p = fs.files; p; p = p->next)
        if (p->metaPage == metaPage) {
            p->rewind();
            p->metaSize = 0;
            p->writePage = 0xffff;
        }
}

void File::del() {
    fs.lock();
    primary()->delCore(true);
    fs.unlock();
}

void File::overwrite(const void *data, uint32_t len) {

    auto prim = primary();
    if (prim != this) {
        prim->overwrite(data, len);
        return;
    }

    fs.lock();

    fs.flash.readBytes(metaPageAddr(), fs.buf, SNORFS_PAGE_SIZE);
    int freePtr = 0;
    for (int i = fs.metaStart(); i + 2 + 6 < SNORFS_PAGE_SIZE; i += 3) {
        if (fs.buf[i] == 0xff && fs.buf[i + 1] == 0xff) {
            freePtr = i;
            break;
        }
    }

    if (freePtr) {
        uint8_t clearMark[] = {0, 0, 0};
        delCore(false);
        fs.flash.writeBytes(metaPageAddr() + freePtr, clearMark, 3);
    } else {
        int len = strlen((char *)fs.buf + 1);
        char tmp[len];
        strcpy(tmp, (char *)fs.buf + 1);
        delCore(true);
        metaPage = fs.createMetaPage(tmp);
    }
    writePage = 0;
    rewind();
    fs.unlock();

    append(data, len);
}

int FS::readFlashBytes(uint32_t addr, void *buffer, uint32_t len) {
    lock();
    int r = flash.readBytes(addr, buffer, len);
    unlock();
    return r;
}

#ifdef SNORFS_TEST
void FS::dump() {
    if (numRows == 0) {
        LOG("not mounted\n");
        mount();
    }
    LOG("row#: %d; remap: ", numRows);

    for (unsigned i = 0; i < numRows + 1; ++i) {
        BlockHeader hd;
        auto addr = i * rowSize;
        flash.readBytes(addr, &hd, sizeof(hd));
        LOG("[%d: %d] ", (int16_t)hd.logicalBlockId, hd.eraseCount);
    }

    LOG("free: %d/%d, (junk: %d)", freePages + deletedPages, fullPages + freePages + deletedPages,
        deletedPages);
    LOG("\n");
}

void FS::debugDump() {
    // dump();
}

void File::debugDump() {
    LOGV("fileID: 0x%x, rd: 0x%x/%d, wr: 0x%x/%d\n", fileID(), readPage, tell(), writePage,
         metaSize);
}
#endif