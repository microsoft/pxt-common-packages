#include "SNORFS.h"
#include "CodalDmesg.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include <stddef.h>

#define oops() target_panic(DEVICE_FLASH_ERROR)

#define OFF2(v, basePtr) (int)((uintptr_t)v - (uintptr_t)basePtr)
#define OFF(v) OFF2(v, basePtr)

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

FS::FS(Flash &flash, uintptr_t baseAddr, uint32_t bytes)
    : flash(flash), baseAddr(baseAddr), bytes(bytes) {
    files = NULL;
    locked = false;

    basePtr = NULL;
    endPtr = NULL;
    freeDataPtr = NULL;
    metaPtr = NULL;
    readDirPtr = NULL;
    flashBufAddr = 0;

    if (bytes > 0xffff * 4 * 2)
        oops();

    auto page = flash.pageSize(baseAddr);
    // baseAddr and bytes needs to page-aligned, and we need even number of pages
    auto numPages = bytes / page;
    if ((baseAddr & (page - 1)) || bytes % page || numPages < 2 || (numPages & 1))
        oops();

    if (!snorfs_unlocked_event)
        snorfs_unlocked_event = codal::allocateNotifyEvent();
}

void FS::erasePages(uintptr_t addr, uint32_t len) {
    auto end = addr + len;
    auto page = flash.pageSize(addr);
    if (addr & (page - 1))
        oops();
    while (addr < end) {
        if (flash.pageSize(addr) != page)
            oops();
        flash.erasePage(addr);
        addr += page;
    }
}

void FS::flushFlash() {
    if (flashBufAddr) {
        flash.writeBytes(flashBufAddr, flashBuf, sizeof(flashBuf));
        flashBufAddr = 0;
    }
}

void FS::writeBytes(void *dst, const void *src, uint32_t size) {
    LOGV("write %x %d", OFF(dst), size);
    while (size > 0) {
        uint32_t off = (uintptr_t)dst & (sizeof(flashBuf) - 1);
        uintptr_t newaddr = (uintptr_t)dst - off;
        if (newaddr != flashBufAddr) {
            flushFlash();
            memset(flashBuf, 0xff, sizeof(flashBuf));
            flashBufAddr = newaddr;
        }

        unsigned n = sizeof(flashBuf) - off;
        if (n > size)
            n = size;
        memcpy(flashBuf + off, src, n);
        size -= n;
        src = (const uint8_t *)src + n;
    }
}

#define RAFFS_MAGIC 0x67862084
#define M1 0xffffffffU

void FS::format() {
    if (files)
        oops();

    erasePages(baseAddr, bytes / 2);
    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    writeBytes((void *)baseAddr, &hd, sizeof(hd));

    // in case the secondary header is valid, clear it
    auto hd2 = (FSHeader *)(baseAddr + bytes / 2);
    if (hd2->magic == RAFFS_MAGIC) {
        hd.magic = 0;
        hd.bytes = 0;
        writeBytes(hd2, &hd, sizeof(hd));
    }

    flushFlash();
}

bool FS::tryMount() {
    if (basePtr)
        return true;

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
            return false;
        }
    }

    basePtr = (uint32_t *)addr;
    endPtr = (MetaEntry *)(addr + bytes / 2);

    auto p = (uint32_t *)endPtr - 2;
    while (*p != M1)
        p -= 2;
    metaPtr = (MetaEntry *)(p + 2);

    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p--;
    freeDataPtr = p + 1;

    LOG("mounted, end=%x meta=%x free=%x", OFF(endPtr), OFF(metaPtr), OFF(freeDataPtr));

    return true;
}

void FS::mount() {
    if (tryMount())
        return;
    format();
    if (!tryMount())
        oops();
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
    flushFlash();
    locked = false;
#ifndef SNORFS_TEST
    Event(DEVICE_ID_NOTIFY, snorfs_unlocked_event);
#endif
}

MetaEntry *FS::findMetaEntry(const char *filename) {
    uint16_t h = fnhash(filename);
    uint16_t buflen = strlen(filename) + 1;

    for (auto p = metaPtr; p < endPtr; p++) {
        //LOGV("check at %x %x %x", OFF(p),p->fnhash,h);
        if (p->fnhash == h && memcmp(basePtr + p->fnptr, filename, buflen) == 0)
            return p;
    }

    //LOGV("fail");

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

uintptr_t FS::copyFile(uint16_t dataptr, uintptr_t dst) {
    if (dataptr == 0xffff)
        return dst;
    for (;;) {
        auto hd = basePtr[dataptr];
        auto nextptr = hd >> 16;
        auto blsz = hd & 0xffff;
        writeBytes((void *)dst, basePtr + dataptr + 1, blsz);
        dst += blsz;
        if (nextptr == 0xffff)
            return dst;
        VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
}

bool FS::tryGC(int spaceNeeded) {
    int spaceLeft = (intptr_t)metaPtr - (intptr_t)freeDataPtr;

    if (spaceLeft > spaceNeeded + 32)
        return false;

    LOG("running GC; needed %d, got %d", spaceNeeded, spaceLeft);

    readDirPtr = NULL;

    auto newBase = (uintptr_t)basePtr == baseAddr ? baseAddr + bytes / 2 : baseAddr;

    flushFlash();

    erasePages(newBase, bytes / 2);

    auto metaDst = (MetaEntry *)(newBase + bytes / 2);
    auto newBaseP = (uint32_t *)newBase;
    auto dataDst = newBaseP + sizeof(FSHeader) / 4;

    for (auto p = metaPtr; p < endPtr; p++) {
        MetaEntry m = *p;
        if (m.dataptr == 0)
            continue;
        auto fnlen = strlen((char *)(basePtr + m.fnptr));
        writeBytes(dataDst, basePtr + m.fnptr, fnlen + 1);
        m.fnptr = dataDst - newBaseP;
        dataDst += (fnlen + 3 + 1) / 4;

        auto sz = getFileSize(m.dataptr);
        if (sz) {
            uint32_t hd = 0xffff0000 | sz;
            writeBytes(dataDst++, &hd, sizeof(hd));
            auto newDst = copyFile(m.dataptr, (uintptr_t)dataDst);
            m.dataptr = (dataDst - 1) - newBaseP;
            dataDst = (uint32_t *)((newDst + 3) & ~3);
        }

        writeBytes(--metaDst, &m, sizeof(m));
        flushFlash();

        for (auto f = files; f; f = f->next) {
            if (f->meta == p) {
                f->resetCaches();
                f->meta = metaDst;
            }
        }
    }

    if (dataDst[-1] == M1) {
        uint32_t eofMark = 0;
        writeBytes(dataDst++, &eofMark, 4);
    }

    if ((intptr_t)metaDst - (intptr_t)dataDst <= spaceNeeded + 32)
        oops(); // out of space!

    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    writeBytes(newBaseP, &hd, sizeof(hd));

    // clear old magic
    hd.magic = 0;
    hd.bytes = 0;
    writeBytes(basePtr, &hd, sizeof(hd));

    flushFlash();

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
        writeBytes(freeDataPtr, filename, buflen - 3);
        flushFlash();
        freeDataPtr += buflen / 4;
    }
    m.dataptr = 0xffff;
    m.flags = 0xfffe;

    auto r = --metaPtr;
    writeBytes(r, &m, sizeof(m));
    flushFlash();

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

DirEntry *FS::dirRead() {
    lock();

    if (readDirPtr == NULL) {
        readDirPtr = metaPtr;
    }

    while (readDirPtr < endPtr) {
        auto p = readDirPtr++;
        if (p->dataptr != 0) {
            dirEnt.size = getFileSize(p->dataptr);
            dirEnt.flags = p->flags;
            dirEnt.name = (const char *)(basePtr + p->fnptr);
            unlock();
            return &dirEnt;
        }
    }

    readDirPtr = NULL;
    unlock();
    return NULL;
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
        auto hd = fs.basePtr[dataptr];
        auto nextptr = hd >> 16;
        auto blsz = hd & 0xffff;
        auto srcptr0 = (uint8_t *)(fs.basePtr + dataptr + 1);
        auto srcptr = srcptr0;
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
        readOffset += n;

        if (len == 0 || nextptr == 0xffff) {
            readOffsetInPage = (srcptr + n) - srcptr0;
            break;
        }

        auto bytes = fs.bytes;
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

    fs.tryGC(len + 4 + 4 + 3);

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

    uint16_t thisPtr = fs.freeDataPtr - fs.basePtr;
    lastPage = thisPtr; // cache it
    fs.writeBytes(pageDst, &thisPtr, sizeof(thisPtr));

    uint32_t newHd = 0xffff0000 | len;
    fs.writeBytes(fs.freeDataPtr++, &newHd, sizeof(newHd));

    fs.writeBytes(fs.freeDataPtr, data, len);

    uint32_t zero = 0;
    if (len & 3) {
        // align with 0s
        fs.writeBytes((uint8_t *)fs.freeDataPtr + len, &zero, 4 - (len & 3));
    } else {
        // check if data ends with M1
        if (*(uint32_t *)((uint8_t *)data + len - 4) == M1) {
            // if so, write some 0s
            fs.writeBytes((uint8_t *)fs.freeDataPtr + len, &zero, 4);
            len += 4;
        }
    }

    fs.freeDataPtr += (len + 3) >> 2;

    fs.unlock();
}

void File::resetAllCaches() {
    for (auto f = fs.files; f; f = f->next) {
        if (f->meta == meta) {
            f->resetCaches();
        }
    }
}

void File::del() {
    fs.lock();
    resetAllCaches();
    if (meta->dataptr) {
        uint16_t zero = 0;
        fs.writeBytes(&meta->dataptr, &zero, sizeof(zero));
    }
    fs.unlock();
}

void File::overwrite(const void *data, uint32_t len) {
    fs.lock();
    resetAllCaches();

    auto numJumps = 0;
    if (meta->dataptr != 0xffff) {
        auto dataptr = meta->dataptr;
        for (;;) {
            auto hd = fs.basePtr[dataptr];
            auto nextptr = hd >> 16;
            uint16_t blsz = hd & 0xffff;
            if (blsz) {
                blsz = 0;
                fs.writeBytes((void *)(fs.basePtr + dataptr), &blsz, 2);
            }
            numJumps++;
            if (nextptr == 0xffff)
                break;
            auto bytes = fs.bytes;
            VALIDATE_NEXT(nextptr);
            dataptr = nextptr;
        }
    }

    auto newMetaNeeded = numJumps > 20;
    auto lenNeeded = len + 8;
    if (newMetaNeeded)
        lenNeeded += sizeof(*meta);

    fs.tryGC(lenNeeded);

    // GC might have reset out meta->dataptr to empty, no need to allocate new meta entry in that
    // case
    if (newMetaNeeded && meta->dataptr != 0xffff) {
        // clear old entry
        uint16_t zero = 0;
        fs.writeBytes(&meta->dataptr, &zero, 2);
        MetaEntry m = *meta;
        m.dataptr = 0xffff;
        --fs.metaPtr;
        fs.writeBytes(fs.metaPtr, &m, sizeof(m));
        fs.flushFlash();
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

int FS::readFlashBytes(uintptr_t addr, void *buffer, uint32_t len) {
    lock();
    memcpy(buffer, (void *)addr, len);
    unlock();
    return len;
}

#ifdef SNORFS_TEST
void FS::dump() {}

void FS::debugDump() {
    // dump();
}

void File::debugDump() {
    LOGV("fileID: 0x%x -> %x, rd: 0x%x/%d", OFF2(meta, fs.basePtr), meta->dataptr, readPage,
         tell());
}
#endif