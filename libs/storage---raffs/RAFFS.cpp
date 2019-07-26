#include "RAFFS.h"
#include "CodalDmesg.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include <stddef.h>

/*
64 bit block structure

uint16_t size;
uint16_t nextptr;
uint8_t data[4];

nextptr points to where the rest of the data of the current block sits
after the data there's another block; if it's all 1, then it's the end
otherwise, if 0x8000&size==0 on that block, then the current block, and
all previous blocks should be discarded

block is always allocated with a FF double-word at the end; new block, when added, starts
at this FF double-word, and continues somewhere further down in flash; the new block then also has a
FF double-word appended in the after-gap area

 */

#if RAFFS_BLOCK == 16
#define RAFFS_MAGIC 0x6786e0da
#elif RAFFS_BLOCK == 64
#define RAFFS_MAGIC 0x83b48620
#else
#error "unsupported RAFFS_BLOCK size"
#endif

#define M1 0xffffffffU

using namespace codal;

#define oops() target_panic(DEVICE_FLASH_ERROR)
#define ASSERT(cond)                                                                               \
    do {                                                                                           \
        if (!(cond))                                                                               \
            oops();                                                                                \
    } while (0)

#define OFF2(v, basePtr) (uint32_t)((uint32_t *)v - (uint32_t *)basePtr)
#define OFF(v) OFF2(v, basePtr)

#undef NOLOG
#define NOLOG(...) ((void)0)
#define LOG DMESG
#define LOGV NOLOG
#define LOGVV NOLOG

#if 0
#undef LOGV
#define LOGV DMESG
#endif

#if 0
#undef LOGVV
#define LOGVV DMESG
#endif

using namespace pxt::raffs;

static uint16_t raffs_unlocked_event;

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
    overwritingFile = NULL;

    if (bytes > 0xffff * 4 * 2)
        oops();

    auto page = flash.pageSize(baseAddr);
    // baseAddr and bytes needs to page-aligned, and we need even number of pages
    auto numPages = bytes / page;
    if ((baseAddr & (page - 1)) || bytes % page || numPages < 2 || (numPages & 1))
        oops();

    if (!raffs_unlocked_event)
        raffs_unlocked_event = codal::allocateNotifyEvent();
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
        for (unsigned i = 0; i < sizeof(flashBuf); ++i)
            if (flashBuf[i] != 0xff && flashBuf[i] != ((uint8_t *)flashBufAddr)[i])
                target_panic(999);
        flashBufAddr = 0;
    }
}

void FS::writeBytes(void *dst, const void *src, uint32_t size) {
    LOGV("write %x%s %d %x:%x:%x:%x",
         OFF(dst) <= OFF2(dst, altBasePtr()) ? OFF(dst) : OFF2(dst, altBasePtr()),
         OFF(dst) <= OFF2(dst, altBasePtr()) ? "" : "*", size, ((const uint8_t *)src)[0],
         ((const uint8_t *)src)[1], ((const uint8_t *)src)[2], ((const uint8_t *)src)[3]);

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
        dst = (uint8_t *)dst + n;
    }
}

void FS::format() {
    if (files)
        oops();

    LOG("formatting...");

    FSHeader hd;

    // in case the secondary header is valid, clear it
    auto hd2 = (FSHeader *)(baseAddr + bytes / 2);
    if (hd2->magic == RAFFS_MAGIC) {
        hd.magic = 0;
        hd.bytes = 0;
        writeBytes(hd2, &hd, sizeof(hd));
    }

    // write the primary header
    erasePages(baseAddr, bytes / 2);
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    writeBytes((void *)baseAddr, &hd, sizeof(hd));

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

#if RAFFS_BLOCK == 64
    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p -= 2;
    freeDataPtr = p + 3;
    if (freeDataPtr[-1] != M1 || freeDataPtr[-2] != M1)
        oops();
#else
    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p--;
    freeDataPtr = p + 1;
#endif
    if (freeDataPtr[0] != M1 || freeDataPtr[1] != M1)
        oops();

    LOG("mounted, end=%x meta=%x free=%x", OFF(endPtr), OFF(metaPtr), OFF(freeDataPtr));

    return true;
}

void FS::mount() {
    // if (basePtr) return;
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
    } else if (meta->dataptr == 0) {
        if (create)
            meta = createMetaPage(filename, meta);
        else
            meta = NULL;
    }
    auto r = meta ? new File(*this, meta) : NULL;
    unlock();
    return r;
}

bool FS::exists(const char *filename) {
    lock();
    auto ex = false;
    auto r = findMetaEntry(filename);
#if RAFFS_BLOCK == 64
    if (r && getFileSize(r->dataptr, NULL) != -1)
        ex = true;
#else
    if (r && r->dataptr)
        ex = true;
#endif
    unlock();
    return ex;
}

void FS::lock() {
    while (locked)
        fiber_wait_for_event(DEVICE_ID_NOTIFY, raffs_unlocked_event);
    locked = true;
    mount();
}

void FS::unlock() {
    if (!locked)
        oops();
    flushFlash();
    locked = false;
#ifndef RAFFS_TEST
    Event(DEVICE_ID_NOTIFY, raffs_unlocked_event);
#endif
}

MetaEntry *FS::findMetaEntry(const char *filename) {
    uint16_t h = fnhash(filename);
    uint16_t buflen = strlen(filename) + 1;

    for (auto p = metaPtr; p < endPtr; p++) {
        // LOGV("check at %x %x %x", OFF(p),p->fnhash,h);
        if (p->fnhash == h && memcmp(basePtr + p->fnptr, filename, buflen) == 0)
            return p;
    }

    // LOGV("fail");

    return NULL;
}

uint16_t FS::findBeginning(uint16_t dataptr) {
#if RAFFS_BLOCK == 64
    uint16_t beg = dataptr;
    for (;;) {
        LOGVV("fb %x sz=%x nx=%x", dataptr, _rawsize(dataptr), _nextptr(dataptr));

        auto nextptr = blnext(dataptr);
        if (!nextptr)
            return beg;

        auto blsz = _rawsize(dataptr);
        if ((blsz & 0x8000) == 0) // this includes RAFFS_DELETED case
            beg = dataptr;

        // LOGV("fb %x sz=%x ->%x [%x]", dataptr, blsz, nextptr, _nextptr(dataptr));

        RAFFS_VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
#else
    return dataptr;
#endif
}

int32_t FS::getFileSize(uint16_t dataptr, uint16_t *lastptr) {
    if (dataptr == 0)
        return -1;

    if (dataptr == 0xffff) {
#if RAFFS_BLOCK == 64
        oops();
#else
        if (lastptr)
            *lastptr = 0;
        return 0;
#endif
    }

    dataptr = findBeginning(dataptr);

    int32_t sz = 0;
    for (;;) {
        auto nextptr = blnext(dataptr);
        auto blsz = _rawsize(dataptr);

        LOGVV("sz dp=%x np=%x sz=%x", dataptr, nextptr, blsz);

#if RAFFS_BLOCK == 64
        if (blsz == RAFFS_DELETED) {
            ASSERT(sz <= 0);
            sz = -1;
        } else if (blsz == 0xffff) {
            ASSERT(!nextptr);
        } else {
            ASSERT(sz != -1);
            ASSERT((blsz & 0x8000) || sz == 0);
            blsz &= ~0x8000;
            sz += blsz;
        }
#else
        if (blsz != 0xffff)
            sz += blsz;
#endif
        if (!nextptr) {
            if (lastptr)
                *lastptr = dataptr;
            return sz;
        }
        RAFFS_VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
}

uintptr_t FS::copyFile(uint16_t dataptr, uintptr_t dst) {
    dataptr = findBeginning(dataptr);
    if (dataptr == 0xffff)
        return dst;
    LOGV("start copy");
#if RAFFS_BLOCK == 64
    auto dst0 = dst;
#endif
    for (;;) {
        auto nextptr = blnext(dataptr);
        auto blsz = blsize(dataptr);
        LOGV("copy dp=%x nxt=%x sz=%d", dataptr, nextptr, blsz);
#if RAFFS_BLOCK == 64
        if (blsz > 4) {
            writeBytes((void *)dst, data0(dataptr), 4);
            writeBytes((uint8_t *)dst + 4, data1(dataptr), blsz - 4);
        } else
#endif
            writeBytes((void *)dst, data0(dataptr), blsz);
        dst += blsz;
        if (!nextptr) {
#if RAFFS_BLOCK == 64
            if (dst0 == dst)
                dst++;
#endif
            return dst;
        }
        RAFFS_VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
}

void FS::forceGC() {
    lock();
    tryGC(0x7fff0000);
    unlock();
}

uint32_t *FS::markEnd(uint32_t *freePtr) {
    flushFlash();
    int active = 0;
#if RAFFS_BLOCK == 64
    if ((uintptr_t)freePtr & 7)
        oops();
    // LOGV("fp=%d [-3]= %x", OFF(freePtr), freePtr[-3]);
    if (freePtr[-3] == M1) {
        uint64_t eofMark = 0;
        writeBytes(freePtr, &eofMark, 8);
        freePtr += 2;
        active = 1;
    }
#else
    if (freePtr[-1] == M1) {
        uint32_t eofMark = 0;
        writeBytes(freePtr++, &eofMark, 4);
        active = 1;
    }
#endif

    LOGV("mark end at=%x a=%d", OFF(freePtr), active);
    return freePtr;
}

bool FS::tryGC(int spaceNeeded) {
    int spaceLeft = (intptr_t)metaPtr - (intptr_t)freeDataPtr;

#ifdef RAFFS_TEST
    for (auto p = freeDataPtr; p < (uint32_t *)metaPtr; p++) {
        if (*p != M1) {
            LOG("value at %x = %x", OFF(p), *p);
            oops();
        }
    }
#endif

    if (spaceLeft > spaceNeeded + 32)
        return true;

    LOG("running flash FS GC; needed %d, left %d", spaceNeeded, spaceLeft);

    readDirPtr = NULL;

    auto newBase = (uintptr_t)basePtr == baseAddr ? baseAddr + bytes / 2 : baseAddr;

    flushFlash();

    erasePages(newBase, bytes / 2);

    MetaEntry *metaDst = (MetaEntry *)(newBase + bytes / 2);
    uint32_t *newBaseP = (uint32_t *)newBase;
    uint32_t *dataDst = newBaseP + sizeof(FSHeader) / 4;

    for (auto p = endPtr - 1; p >= metaPtr; p--) {
        MetaEntry m = *p;
        auto sz = getFileSize(m.dataptr);
        LOGV("GC %s sz=%d", (char *)(basePtr + m.fnptr), sz);
        if (sz < 0)
            continue;

        auto fnlen = strlen((char *)(basePtr + m.fnptr));
        writeBytes(dataDst, basePtr + m.fnptr, fnlen + 1);
        m.fnptr = dataDst - newBaseP;
        dataDst += (fnlen + 1 + 3) >> 2;

#if RAFFS_BLOCK == 64
        uint32_t highHD = (dataDst + 2 - newBaseP) << 16;
#else
        uint32_t highHD = 0xffff0000;
        if (!sz)
            m.dataptr = 0xffff;
        else
#endif
        {
            uint32_t hd = highHD | sz;
            auto newdataptr = dataDst - newBaseP;
            writeBytes(dataDst++, &hd, sizeof(hd));
            auto newDst = copyFile(m.dataptr, (uintptr_t)dataDst);
            dataDst = (uint32_t *)RAFFS_ROUND(newDst);
            m.dataptr = newdataptr;
#if RAFFS_BLOCK == 64
            dataDst += 2;
#endif
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

    dataDst = markEnd(dataDst);

    if ((intptr_t)metaDst - (intptr_t)dataDst <= spaceNeeded + 32) {
#ifdef RAFFS_TEST
        if (spaceNeeded != 0x7fff0000)
            oops();
#else
        return false;
#endif
    }

    LOG("GC done: %d free", (int)((intptr_t)metaDst - (intptr_t)dataDst));

    flushFlash();

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
    auto buflen = RAFFS_ROUND(strlen(filename) + 1);

    auto prevBase = basePtr;
    if (!tryGC(sizeof(MetaEntry) + (existing ? 0 : buflen)))
        return NULL;

    // if we run the GC, the existing meta page is gone; re-create it
    if (prevBase != basePtr) {
        existing = NULL;
        // we may need more space now
        if (!tryGC(sizeof(MetaEntry) + buflen))
            return NULL;
    }

    MetaEntry m;

    if (existing) {
#if RAFFS_BLOCK == 64
        oops();
#endif
        m = *existing;
    } else {
        m.fnhash = fnhash(filename);
        m.fnptr = freeDataPtr - basePtr;
        writePadded(filename, strlen(filename) + 1);
        flushFlash();
    }

    m.flags = 0xfffe;

#if RAFFS_BLOCK == 64
    // we allocate a free double-word for the data
    // the previous double word is non-ff since it's the 0-terminated file name
    m.dataptr = freeDataPtr - basePtr;
    freeDataPtr += 2;
#else
    m.dataptr = 0xffff;
#endif

    flushFlash();

    auto r = --metaPtr;
    LOGV("write meta @%x: h=%x fn=%x fl=%x dp=%x", OFF(r), m.fnhash, m.fnptr, m.flags, m.dataptr);
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
        int sz = getFileSize(p->dataptr);
        if (sz < 0)
            continue;
        dirEnt.size = sz;
        dirEnt.flags = p->flags;
        dirEnt.name = (const char *)(basePtr + p->fnptr);
        unlock();
        return &dirEnt;
    }

    readDirPtr = NULL;
    unlock();
    return NULL;
}

int32_t File::size() {
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
    LOGV("read(%d)", len);
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

    uint16_t dataptr = readPage ? readPage : fs.findBeginning(meta->dataptr);

    int nread = 0;
    for (;;) {
        auto nextptr = fs.blnext(dataptr);
        auto blsz = fs.blsize(dataptr);
        auto srcptr = (uint8_t *)fs.data0(dataptr);
        auto curroff = 0;

        if (readOffsetInPage) {
            LOGV("roff=%d blsz=%d", readOffsetInPage, blsz);
            if (readOffsetInPage > blsz)
                oops();
#if RAFFS_BLOCK == 64
            if (readOffsetInPage >= 4) {
                curroff = 4;
                srcptr = (uint8_t *)fs.data1(dataptr);
                readOffsetInPage -= 4;
                blsz -= 4;
            }
#endif
            blsz -= readOffsetInPage;
            srcptr += readOffsetInPage;
            curroff += readOffsetInPage;
            readOffsetInPage = 0;
        }

        int n = blsz;
        if (blsz > (int)len) {
            n = len;
        }

        LOGV("n=%d len=%d np=%x blsz=%d [%d]", n, len, nextptr, blsz, fs._rawsize(dataptr));

        if (n && data) {
            LOGV("read: %x:%x:...", srcptr[0], srcptr[1]);
#if RAFFS_BLOCK == 64
            int left = 0;
            if (curroff < 4) {
                left = 4 - curroff;
                if (left > n)
                    left = n;
                memcpy(data, srcptr, left);
                if (n - left > 0) {
                    srcptr = (uint8_t *)fs.data1(dataptr);
                    memcpy((uint8_t *)data + left, srcptr, n - left);
                }
            } else {
                memcpy(data, srcptr, n);
            }
#else
            memcpy(data, srcptr, n);
#endif
            data = (uint8_t *)data + n;
        }

        curroff += n;
        nread += n;
        len -= n;
        readOffset += n;

        if (len == 0 || nextptr == 0) {
            readOffsetInPage = curroff;
            break;
        }

        auto bytes = fs.bytes;
        RAFFS_VALIDATE_NEXT(nextptr);
        dataptr = nextptr;
    }
    readPage = dataptr;

    fs.unlock();

    return nread;
}

void FS::writePadded(const void *data, uint32_t len) {
    writeBytes(freeDataPtr, data, len);
    uint32_t tail = len & (RAFFS_ROUND(1) - 1);
    if (tail) {
        uint64_t zero = 0;
        writeBytes((uint8_t *)freeDataPtr + len, &zero, RAFFS_ROUND(1) - tail);
    }
    freeDataPtr += RAFFS_ROUND(len) >> 2;
}

int File::append(const void *data, uint32_t len) {
    if ((!fs.overwritingFile && len == 0) || meta->dataptr == 0)
        return 0;

    LOGV("append %s len=%d meta=%x free=%x dp=%x lp=%x", filename(), len,
         OFF2(fs.metaPtr, fs.basePtr), OFF2(fs.freeDataPtr, fs.basePtr), meta->dataptr, lastPage);

    fs.lock();

    if (!fs.tryGC(RAFFS_ROUND(len + 4 + 8))) {
        fs.unlock();
        return -1;
    }

    LOGV("append2 dp=%x lp=%x", meta->dataptr, lastPage);

    if (len >= 0x7ffe)
        oops();

    uint16_t *pageDst;
    if (meta->dataptr == 0xffff) {
#if RAFFS_BLOCK == 64
        oops();
#endif
        pageDst = &meta->dataptr;
    } else {
        fs.getFileSize(lastPage ? lastPage : meta->dataptr, &lastPage);
        if (lastPage == 0)
            oops();
        //LOGV("append - sz=%d lastPage=%x", sz, lastPage);
        pageDst = (uint16_t *)(fs.basePtr + lastPage) + 1;
    }

    if (*pageDst != 0xffff)
        oops();

    uint16_t thisPtr = fs.freeDataPtr - fs.basePtr;
#if RAFFS_BLOCK == 64
    uint32_t newHd = thisPtr << 16;

    if (fs.overwritingFile) {
        if ((uintptr_t)data == RAFFS_DELETED)
            newHd |= RAFFS_DELETED;
        else
            newHd |= len;
    } else {
        newHd |= 0x8000 | len;
    }

    fs.writeBytes(pageDst - 1, &newHd, sizeof(newHd));
    uint8_t tmp[4] = {0};
    memcpy(tmp, data, len < 4 ? len : 4);
    fs.writeBytes(pageDst + 1, tmp, 4);
    if (len > 4)
        fs.writePadded((uint8_t *)data + 4, len - 4);
    fs.freeDataPtr += 2;
#else
    lastPage = thisPtr; // cache it

    uint32_t newHd = 0xffff0000 | len;
    fs.writePadded(&newHd, sizeof(newHd));
    fs.writePadded(data, len);
#endif

    fs.freeDataPtr = fs.markEnd(fs.freeDataPtr);

    // and only at the end update the next link
    fs.flushFlash();

#if RAFFS_BLOCK != 64
    if (*pageDst != 0xffff)
        oops();
    fs.writeBytes(pageDst, &thisPtr, sizeof(thisPtr));
#endif

    fs.unlock();

    return 0;
}

void File::resetAllCaches() {
    for (auto f = fs.files; f; f = f->next) {
        if (f->meta == meta) {
            f->resetCaches();
        }
    }
}

void File::del() {
#if RAFFS_BLOCK == 64
    int sz = fs.getFileSize(meta->dataptr);
    LOGV("del, sz=%d", sz);
    if (sz >= 0) {
        fs.overwritingFile = this;
        append((void *)RAFFS_DELETED, 0);
        fs.overwritingFile = NULL;
        sz = fs.getFileSize(meta->dataptr);
        if (sz != -1)
            oops();
    }
#else
    fs.lock();
    resetAllCaches();
    if (meta->dataptr) {
        uint16_t zero = 0;
        fs.writeBytes(&meta->dataptr, &zero, sizeof(zero));
    }
    fs.unlock();
#endif
}

int File::overwrite(const void *data, uint32_t len) {
    LOGV("overwrite len=%d dp=%x f=%x", len, meta->dataptr, OFF2(fs.freeDataPtr, fs.basePtr));

#if RAFFS_BLOCK == 64
    fs.overwritingFile = this;
    int r = append(data, len);
    if (r == -1 && len > 4) {
        append(data, 0);       // this will mark file as empty
        r = append(data, len); // and this will trigger another GC
    }
    fs.overwritingFile = NULL;
    rewind();
    return r;
#else
    fs.lock();
    resetAllCaches();

    // Try to allocate space before deleting anything to avoid losing the file
    // when we lose the power. We try again later (in case we failed first, but then
    // freed up some space), and check the result code.
    fs.tryGC(len + 16);

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
            RAFFS_VALIDATE_NEXT(nextptr);
            dataptr = nextptr;
        }
    }

    auto newMetaNeeded = numJumps > 20;
    auto lenNeeded = len + 8;
    if (newMetaNeeded)
        lenNeeded += sizeof(*meta);

    if (!fs.tryGC(lenNeeded)) {
        fs.unlock();
        return -1;
    }

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

    return append(data, len);
#endif
}

int FS::readFlashBytes(uintptr_t addr, void *buffer, uint32_t len) {
    lock();
    memcpy(buffer, (void *)addr, len);
    unlock();
    return len;
}

#ifdef RAFFS_TEST
void FS::dump() {}

void FS::debugDump() {
    // dump();
}

void File::debugDump() {
    LOGV("fileID: 0x%x -> %x, rd: 0x%x/%d", OFF2(meta, fs.basePtr), meta->dataptr, readPage,
         tell());
}
#endif