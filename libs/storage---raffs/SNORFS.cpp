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
    readOffset = 0;
    readOffsetInPage = 0;
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

#define VALIDATE_NEXT(nextptr)                                                                     \
    if (nextptr == 0 || nextptr > bytes / 8)                                                       \
    oops()

uint32_t FS::getFileSize(uint16_t dataptr, uint16_t *lastptr) {
    if (dataptr == 0xffff) {
        if (lastptr)
            *lastptr = 0;
        return 0;
    }
    uint32_t sz = 0;
    for (;;) {
        auto hd = basePtr[dataptr];
        auto nextptr = hd >> 16;
        auto blsz = hd & 0xffff;
        sz += blsz;
        if (nextptr == 0xffff) {
            if (lastptr)
                *lastptr = dataptr;
            return sz;
        }
        VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
}

uint32_t FS::copyFile(uint16_t dataptr, uint32_t dst) {
    if (dataptr == 0xffff)
        return dst;
    for (;;) {
        auto hd = basePtr[dataptr];
        auto nextptr = hd >> 16;
        auto blsz = hd & 0xffff;
        flash.writeBytes((void *)dst, basePtr + dataptr + 1, blsz);
        dst += blsz;
        if (nextptr == 0xffff)
            return dst;
        VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
}

bool FS::tryGC(int spaceNeeded) {
    int spaceLeft = (int)metaPtr - (int)freeDataPtr;

    if (spaceLeft > spaceNeeded + 32)
        return false;

    auto newBase = (uint32_t)basePtr == baseAddr ? baseAddr + bytes / 2 : baseAddr;

    erasePages(newBase, bytes / 2);

    auto metaDst = (MetaEntry *)(newBase + bytes / 2);
    auto newBaseP = (uint32_t *)newBase;
    auto dataDst = newBaseP + sizeof(FSHeader) / 4;

    for (auto p = metaPtr; p < endPtr; p++) {
        MetaEntry m = *p;
        if (m.dataptr == 0)
            continue;
        auto fnlen = strlen((char *)(basePtr + m.fnptr));
        flash.write(dataDst, basePtr + m.fnptr, fnlen + 1);
        m.fnptr = dataDst - newBaseP;
        dataDst += (fnlen + 3 + 1) / 4;

        auto sz = getFileSize(m.dataptr);
        if (sz) {
            uint32_t hd = 0xffff0000 | sz;
            flash.writeBytes(dataDst++, &hd, sizeof(hd));
            auto newDst = copyFile(m.dataptr, (uint32_t)dataDst);
            m.dataptr = (dataDst - 1) - newBasePtr;
            dataDst = (uint32_t *)((newDst + 3) & ~3);
        }

        flash.write(--metaDst, &m, sizeof(m));

        for (auto f = files; f; f = f->next) {
            if (f->meta == p) {
                f->resetCaches();
                f->meta = metaDst;
            }
        }
    }

    if (dataDst[-1] == M1) {
        uint32_t eofMark = 0;
        flash.write(dataDst++, &eofMark, 4);
    }

    if ((int)metaDst - (int)dataDst <= spaceNeeded + 32)
        oops(); // out of space!

    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    flash.write(newBaseP, &hd, sizeof(hd));

    // clear old magic
    hd.magic = 0;
    hd.bytes = 0;
    flash.write(basePtr, &hd, sizeof(hd));

    basePtr = newBaseP;
    endPtr = (MetaEntry *)(newBase + bytes / 2);
    metaPtr = metaDst;
    freeDataPtr = dataDst;

    return true;
}

MetaEntry *FS::createMetaPage(const char *filename, MetaEntry *existing) {
    auto buflen = strlen(filename) + 4;

    if (tryGC(sizeof(MetaEntry) + (existing ? 0 : buflen))) {
        existing = NULL;
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

File::File(FS &f, MetaEntry *existing) : fs(f) {
    meta = existing;
    lastPage = 0;
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

uint32_t File::size() {
    fs.lock();
    auto r = fs.getFileSize(meta->dataptr);
    fs.unlock();
    return r;
}

File *File::primary() {
    for (auto p = fs.files; p; p = p->next)
        if (p->meta == meta)
            return p;
    oops();
    return NULL;
}

int File::read(void *data, uint32_t len) {
    if (!len)
        return 0;

    if (!readPage && readOffset) {
        auto tmp = readOffset;
        readOffset = 0;
        auto res = read(NULL, tmp);
        if (res < tmp)
            return 0; // EOF reached
    }

    if (meta->dataptr == 0xffff)
        return 0;

    if (meta->dataptr == 0)
        return -1;

    fs.lock();

    if (len > 0x7fffffffU)
        len = 0x7fffffffU;

    uint16_t dataptr = readPage ? readPage : meta->dataptr;

    int nread = 0;
    for (;;) {
        auto hd = basePtr[dataptr];
        auto nextptr = hd >> 16;
        auto blsz = hd & 0xffff;
        auto srcptr0 = (uint8_t *)(basePtr + dataptr + 1);
        auto srcptr = srcptr;
        if (readOffsetInPage) {
            if (readOffsetInPage > blsz)
                oops();
            blsz -= readOffsetInPage;
            srcptr += readOffsetInPage;
            readOffsetInPage = 0;
        }

        auto n = blsz;
        if (blsz > len) {
            n = len;
        }

        if (n && data) {
            memcpy(data, srcptr, n);
            data = (uint8_t *)data + n;
        }

        nread += n;
        len -= n;

        if (blsz >= len || nextptr == 0xffff) {
            readOffsetInPage = (srcptr + n) - srcptr0;
            break;
        }

        VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
    readPage = dataptr;

    fs.unlock();

    return nread;
}

void File::append(const void *data, uint32_t len) {
    if (len == 0 || meta->dataptr == 0)
        return;

    fs.lock();

    tryGC(len + 4 + 3);

    if (len > 0xfffe)
        oops();

    uint16_t *pageDst;
    if (meta->dataptr == 0xffff) {
        pageDst = &meta->dataptr;
    } else {
        fs.getFileSize(lastPage ? lastPage : meta->dataptr, &lastPage);
        if (lastPage == 0)
            oops();
        pageDst = (uint16_t *)(fs.basePtr + lastPage) + 1;
    }

    if (*pageDst != 0xffff)
        oops();

    uint16_t thisPtr = freeDataPtr - basePtr;
    lastPage = thisPtr; // cache it
    fs.flash.writeBytes((uint32_t)pageDst, &thisPtr, sizeof(thisPtr));

    uint32_t newHd = 0xffff0000 | len;
    fs.flash.writeBytes(freeDataPtr++, &newHd, sizeof(newHd));

    fs.flash.writeBytes(freeDataPtr, data, len);

    freeDataPtr += (len + 3) >> 2;

    fs.unlock();
}

void File::del() {
    fs.lock();
    resetCaches();
    if (meta->dataptr) {
        uint16_t zero = 0;
        fs.flash.writeBytes(&meta->dataptr, &zero, sizeof(zero));
    }
    fs.unlock();
}

void File::overwrite(const void *data, uint32_t len) {
    for (auto f = fs.files; f; f = f->next) {
        if (f->meta == meta) {
            f->resetCaches();
        }
    }

    fs.lock();

    auto numJumps = 0;
    if (meta->dataptr != 0xffff) {
        auto dataptr = meta->dataptr;
        for (;;) {
            auto hd = basePtr[dataptr];
            auto nextptr = hd >> 16;
            uint16_t blsz = hd & 0xffff;
            if (blsz) {
                blsz = 0;
                fs.flash.writeBytes((void *)(basePtr + dataptr), &blsz, 2);
            }
            numJumps++;
            if (nextptr == 0xffff)
                break;
            VALIDATE_NEXT(nextptr);
            dataptr = nextptr;
        }
    }

    auto newMetaNeeded = numJumps > 20;
    auto lenNeeded = len + 8;
    if (newMetaNeeded)
        lenNeeded += sizeof(*meta);

    tryGC(lenNeeded);

    // GC might have reset out meta->dataptr to empty, no need to allocate new meta entry in that
    // case
    if (newMetaNeeded && meta->dataptr != 0xffff) {
        // clear old entry
        uint16_t zero = 0;
        fs.flash.writeBytes(&meta->dataptr, &zero, 2);
        MetaEntry m = *meta;
        m.dataptr = 0xffff;
        --fs.metaPtr;
        fs.flash.writeBytes(fs.metaPtr, &m, sizeof(m));
        // set everyone's (including ours) meta ptr
        for (auto f = fs.files; f; f = f->next) {
            if (f->meta == meta) {
                f->meta = fs.metaPtr;
            }
        }
    }

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