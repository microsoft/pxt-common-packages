#include "RAFFS.h"
#include "CodalDmesg.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include <stddef.h>

#define RAFFS_MAGIC 0x6776e0da
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

    if (bytes > 0x20000)
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

    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p--;
    freeDataPtr = RAFFS_ROUND(p + 1);

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

int FS::write(const char *keyName, const uint8_t *data, uint32_t bytes) {
    lock();
    uint32_t szneeded = bytes;
    auto existing = findMetaEntry(keyName);
    
    if (!existing)
        szneeded += strlen(keyName) + 1;
    
    if (!tryGC(sizeof(MetaEntry) + RAFFS_ROUND(szneeded))) {
        unlock();
        return -1;
    }

    MetaEntry newMeta;
    if (existing) {
        newMeta = *existing;
    } else {
        newMeta.fnhash = fnhash(keyName);
        newMeta.fnptr = 
    }

        newMeta._datasize = bytes;
        if (existing) 
        newMeta._datasize |= RAFFS_FOLLOWING_MASK;

    int size = -1;
    if (meta != NULL) {
        r = meta->datasize();
        if (data) {
            if (bytes > r) bytes = r;
            memcpy(data, dataptr(meta), bytes);
        }
    }
    unlock();
    return r;

}

int FS::read(const char *keyName, uint8_t *data, uint32_t bytes) {
    lock();
    int r = -1;
    auto meta = findMetaEntry(keyName);
    if (meta != NULL) {
        r = meta->datasize();
        if (data) {
            if (bytes > r) bytes = r;
            memcpy(data, dataptr(meta), bytes);
        }
    }
    unlock();
    return r;
}

int remove(const char *keyName) {
    write(keyName, NULL, M1);
}

int FS::get(const char *filename, bool create) {
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
    flushFlash();

    LOG("GC done: %d free", (int)((intptr_t)metaDst - (intptr_t)dataDst));

    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    writeBytes(newBaseP, &hd, sizeof(hd));

    // clear old magic
    hd.magic = 0;
    hd.bytes = 0;
#if RAFFS_BLOCK == 64
    erasePages((uintptr_t)basePtr, flash.pageSize((uintptr_t)basePtr));
#endif
    writeBytes(basePtr, &hd, sizeof(hd));

    flushFlash();

    basePtr = newBaseP;
    endPtr = (MetaEntry *)(newBase + bytes / 2);
    metaPtr = metaDst;
    freeDataPtr = dataDst;

    if ((intptr_t)metaDst - (intptr_t)dataDst <= spaceNeeded + 32) {
#ifdef RAFFS_TEST
        if (spaceNeeded != 0x7fff0000)
            oops();
#else
        LOG("out of space! needed=%d", spaceNeeded);
        return false;
#endif
    }

    return true;
}

DirEntry *FS::dirRead() {
    lock();

    if (readDirPtr == NULL) {
        readDirPtr = endPtr - 1;
    }

    while (readDirPtr >= metaPtr) {
        auto p = readDirPtr--;
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

void FS::writePadded(const void *data, uint32_t len) {
    writeBytes(freeDataPtr, data, len);
    uint32_t tail = len & (RAFFS_ROUND(1) - 1);
    if (tail) {
        uint64_t zero = 0;
        writeBytes((uint8_t *)freeDataPtr + len, &zero, RAFFS_ROUND(1) - tail);
    }
    freeDataPtr += RAFFS_ROUND(len) >> 2;
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
#endif