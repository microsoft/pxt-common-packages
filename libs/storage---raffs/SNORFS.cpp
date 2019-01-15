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

struct FSHeader {
    uint32_t magic;
    uint32_t bytes;
    uint32_t reserved0;
    uint32_t reserved1;
};

// https://tools.ietf.org/html/draft-eastlake-fnv-14#section-3
static uint16_t fnhash(const char *fn) {
    uint32_t h = 0x811c9dc5;
    while (*fn)
        h = (h * 0x1000193) ^ (uint8_t)*fn++;
    return h ^ (h >> 16);
}

FS::FS(Flash &flash, uint32_t baseAddr, uint32_t bytes)
    : flash(flash), baseAddr(baseAddr), bytes(bytes) {
    dirptr = 0;
    files = NULL;
    locked = false;

    basePtr = NULL;
    endPtr = NULL;
    freeDataPtr = NULL;
    metaPtr = NULL;

    if (bytes > 0xffff * 4 * 2)
        oops();

    auto page = flash.page_size(baseAddr);
    // baseAddr and bytes needs to page-aligned, and we need even number of pages
    auto numPages = bytes / page;
    if ((baseAddr & (page - 1)) || bytes % page || numPages < 2 || (numPages & 1))
        oops();

    if (!snorfs_unlocked_event)
        snorfs_unlocked_event = codal::allocateNotifyEvent();
}

void FS::erasePages(uint32_t addr, uint32_t len) {
    auto end = addr + len;
    auto page = flash.page_size(addr);
    if (addr & (page - 1))
        oops();
    while (addr < end) {
        if (flash.page_size(addr) != page)
            oops();
        flash.erase_page(addr);
        addr += page;
    }
}

#define RAFFS_MAGIC 0x67862084
#define M1 0xffffffffU

void FS::format() {
    if (files)
        oops();

    busy();

    erasePages(baseAddr, bytes / 2);
    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    flash.write((void *)baseAddr, &hd, sizeof(hd));

    // in case the secondary header is valid, clear it
    auto hd2 = (FSHeader *)(baseAddr + bytes / 2);
    if (hd2->magic == RAFFS_MAGIC) {
        hd.magic = 0;
        hd.bytes = 0;
        flash.write(hd2, &hd, sizeof(hd));
    }

    busy(false);
}

void FS::gcCore(bool force, bool isData) {
    debugDump();
}

void FS::mount() {
    if (basePtr)
        return;

    auto addr = baseAddr + bytes / 2;

    auto hd = (FSHeader *)addr;
    if (hd->magic == RAFFS_MAGIC && hd->bytes == bytes) {
        // OK
    } else {
        addr = baseAddr;
        hd = (FSHeader *)addr;
        if (hd->magic == RAFFS_MAGIC && hd->bytes == bytes) {
            // OK
        } else {
            format();
        }
    }

    basePtr = (uint32_t *)addr;
    endPtr = (MetaEntry *)(addr + bytes / 2);

    auto p = (uint32_t *)endPtr - 2;
    while (*p != M1)
        p -= 2;
    metaPtr = (MetaPtr *)(p + 2);

    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p--;
    freeDataPtr = p + 1;
}

FS::~FS() {}

void File::rewind() {
    readPage = 0;
    readMetaPage = 0;
    readOffset = 0;
    readOffsetInPage = 0;
    readPageSize = 0;
}

File *FS::open(const char *filename, bool create) {
    lock();
    auto meta = findMetaEntry(filename);
    if (meta == NULL) {
        if (create)
            meta = createMetaPage(filename, NULL);
        else
            return NULL;
    } else if (meta->dataptr == 0) {
        if (create)
            meta = createMetaPage(filename, meta);
        else
            return NULL;
    }
    auto r = new File(*this, meta);
    unlock();
    return r;
}

bool FS::exists(const char *filename) {
    lock();
    auto ex = false;
    auto r = findMetaEntry(filename);
    if (r && r->dataptr)
        ex = true;
    unlock();
    return ex;
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

MetaEntry *FS::findMetaEntry(const char *filename) {
    uint16_t h = fnhash(filename);
    uint16_t buflen = strlen(filename) + 1;

    for (auto p = metaPtr; p < endPtr; p++) {
        if (p->fnhash == h && memcmp(basePtr + p->fnptr, filename, buflen) == 0)
            return p;
    }

    return NULL;
}

bool FS::tryGC(uint32_t spaceNeeded) {}

MetaEntry *FS::createMetaPage(const char *filename, MetaEntry *existing) {
    auto buflen = strlen(filename) + 4;

    if (tryGC(sizeof(MetaEntry) + (existing ? 0 : buflen))) {
        existsing = NULL;
    }

    MetaEntry m;

    if (existing) {
        m = *existing;
    } else {
        m.fnhash = fnhash(filename);
        m.fnptr = freeDataPtr - basePtr;
        flash.write(freeDataPtr, filename, buflen - 3);
        freeDataPtr += buflen / 4;
    }
    m.dataptr = 0xffff;
    m.reserved = 0;

    auto r = --metaPtr;
    flash.write(r, &m, sizeof(m));

    return r;
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