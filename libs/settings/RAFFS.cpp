#include "RAFFS.h"
#include "CodalDmesg.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include "Timer.h"
#include "pxtbase.h"

#include <stddef.h>

#define RAFFS_MAGIC 0x7776e0da
#define M1 0xffffffffU

#define CHECK
//#undef CHECK

using namespace codal;

#define oops() target_panic(DEVICE_FLASH_ERROR)

#define OFF2(v, basePtr) (uint32_t)((uint8_t *)v - (uint8_t *)basePtr)
#define OFF(v) OFF2(v, basePtr)

#define REAL_OFF(dst) (OFF(dst) <= OFF2(dst, altBasePtr()) ? OFF(dst) : OFF2(dst, altBasePtr()))

#undef NOLOG
#define NOLOG(...) ((void)0)
#ifndef RAFFS_TEST
#define LOG DMESG
#define LOGV NOLOG
#endif

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
    uint32_t numgc;
    uint32_t reserved;
};

static uint16_t fnhash(const char *fn) {
    uint32_t h = hash_fnv1(fn, strlen(fn));
    return h ^ (h >> 16);
}

FS::FS(Flash &flash, uintptr_t baseAddr, uint32_t bytes)
    : flash(flash), baseAddr(baseAddr), bytes(bytes) {
    locked = false;

    basePtr = NULL;
    endPtr = NULL;
    freeDataPtr = NULL;
    metaPtr = NULL;
    readDirPtr = NULL;
    cachedMeta = NULL;
    flashBufAddr = 0;
    blocked = NULL;
    gcHorizon = -10000000;
    minGCSpacing = 0;

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
#ifdef CHECK
        for (int i = 0; i < page; ++i)
            if (((uint8_t *)addr)[i] != 0xff)
                oops();
#endif
        addr += page;
    }
}

void FS::oopsAndClear() {
    erasePages(baseAddr, bytes);
    oops();
}

void FS::flushFlash() {
    if (flashBufAddr) {
        int r = flash.writeBytes(flashBufAddr, flashBuf, sizeof(flashBuf));
        if (r)
            oopsAndClear();
#ifdef CHECK
        for (unsigned i = 0; i < sizeof(flashBuf); ++i)
            if (flashBuf[i] != 0xff && flashBuf[i] != ((uint8_t *)flashBufAddr)[i])
                oopsAndClear();
#endif
        flashBufAddr = 0;
    }
}

void FS::writeBytes(void *dst, const void *src, uint32_t size) {
    LOGVV("write %x%s %d %x:%x:%x:%x", REAL_OFF(dst), OFF(dst) == REAL_OFF(dst) ? "" : "*", size,
          ((const uint8_t *)src)[0], ((const uint8_t *)src)[1], ((const uint8_t *)src)[2],
          ((const uint8_t *)src)[3]);

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

#define IS_VALID(hd) ((hd)->magic == RAFFS_MAGIC && (hd)->bytes == bytes)

void FS::format() {
    cachedMeta = NULL;
    readDirPtr = NULL;
    clearBlocked();

    LOG("formatting...");

    FSHeader hd;
    hd.reserved = M1;
    hd.numgc = 1;

    // in case the secondary header is valid, copy #gc
    auto hd2 = (FSHeader *)(baseAddr + bytes / 2);
    if (IS_VALID(hd2)) {
        hd.numgc = hd2->numgc + 1;
    }

    // write the primary header
    erasePages(baseAddr, bytes / 2);
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    writeBytes((void *)baseAddr, &hd, sizeof(hd));

    flushFlash();
}

#define NUMBLOCKED (int)(sizeof(blocked->fnptrs) / sizeof(uint16_t))

bool FS::checkBlocked(MetaEntry *m) {
    auto fnptr = m->fnptr;
    for (auto p = blocked; p; p = p->next) {
        for (int i = 0; i < NUMBLOCKED; ++i)
            if (p->fnptrs[i] == fnptr) {
                if (m->isFirst())
                    p->fnptrs[i] = 0;
                return true;
            }
    }
    if (!m->isFirst()) {
        for (auto p = blocked; p; p = p->next) {
            for (int i = 0; i < NUMBLOCKED; ++i)
                if (p->fnptrs[i] == 0) {
                    p->fnptrs[i] = fnptr;
                    return false;
                }
        }
        auto p = new BlockedEntries;
        memset(p, 0, sizeof(*p));
        p->next = blocked;
        blocked = p;
        p->fnptrs[0] = fnptr;
    }
    return false;
}

void FS::clearBlocked() {
    while (blocked) {
        auto p = blocked;
        blocked = p->next;
        delete p;
    }
}

bool FS::tryMount() {
    if (basePtr)
        return true;

    auto hd0 = (FSHeader *)baseAddr;
    auto hd1 = (FSHeader *)(baseAddr + bytes / 2);

    auto v0 = IS_VALID(hd0);
    auto v1 = IS_VALID(hd1);

    if (v0 && v1) {
        // we account for overflows
        // they should not occur in normal operation though
        if (hd0->numgc + 1 == hd1->numgc)
            v0 = false;
        else if (hd1->numgc + 1 == hd0->numgc || hd1->numgc < hd0->numgc)
            v1 = false;
        else
            v0 = false;
    }

    uintptr_t addr;

    if (v0)
        addr = baseAddr;
    else if (v1)
        addr = baseAddr + bytes / 2;
    else
        return false;

    basePtr = (uint8_t *)addr;
    endPtr = (MetaEntry *)(addr + bytes / 2);

    auto p = (uint32_t *)endPtr - 2;
    while (*p != M1)
        p -= 2;
    metaPtr = (MetaEntry *)(p + 2);

    p = (uint32_t *)metaPtr - 1;
    while (*p == M1)
        p--;
    freeDataPtr = (uint8_t *)RAFFS_ROUND(p + 1);

    auto fp = (uint32_t *)freeDataPtr;
    if (fp[0] != M1 || fp[1] != M1)
        oopsAndClear();

    LOG("mounted, end=%x meta=%x free=%x", OFF(endPtr), OFF(metaPtr), OFF(freeDataPtr));

    return true;
}

void FS::mount() {
    // if (basePtr) return;
    if (tryMount())
        return;
    format();
    if (!tryMount())
        oopsAndClear();
}

FS::~FS() {}

int FS::write(const char *keyName, const void *data, uint32_t bytes) {
    auto isDel = data == NULL && bytes == M1;
    if (!isDel && !data && bytes)
        oops();

    if (isDel)
        LOGV("del: %s", keyName);
    else
        LOGV("write: %s sz=%d", keyName, bytes);

    lock();
    uint32_t szneeded = bytes;
    auto existing = findMetaEntry(keyName);
    auto prevBase = basePtr;

    cachedMeta = NULL;

    if (!existing) {
        if (isDel) {
            unlock();
            return -1;
        }
        szneeded += strlen(keyName) + 1;
    }

    if (!tryGC(sizeof(MetaEntry) + RAFFS_ROUND(szneeded))) {
        unlock();
        return -1;
    }

    // if the GC happened, find the relocated meta entry
    if (prevBase != basePtr)
        existing = findMetaEntry(keyName);

    MetaEntry newMeta;
    if (existing) {
        newMeta.fnhash = existing->fnhash;
        newMeta.fnptr = existing->fnptr;
    } else {
        newMeta.fnhash = fnhash(keyName);
        newMeta.fnptr = writeData(keyName, strlen(keyName) + 1);
    }
    newMeta.dataptr = isDel ? 0 : writeData(data, bytes);
    newMeta._datasize = bytes;
    if (existing)
        newMeta._datasize |= RAFFS_FOLLOWING_MASK;
    finishWrite();

    writeBytes(--metaPtr, &newMeta, sizeof(newMeta));
    flushFlash();

    unlock();
    return 0;
}

int FS::read(const char *keyName, void *data, uint32_t bytes) {
    lock();
    int r = -1;
    MetaEntry *meta;
    if (keyName) {
        cachedMeta = meta = findMetaEntry(keyName);
    } else {
        meta = cachedMeta;
    }
    if (meta != NULL && meta->dataptr) {
        r = meta->datasize();
        if (data) {
            if (bytes > (unsigned)r)
                bytes = r;
            memcpy(data, basePtr + meta->dataptr, bytes);
        }
    }
    unlock();
    return r;
}

int FS::remove(const char *keyName) {
    return write(keyName, NULL, M1);
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
        if (p->fnhash == h && memcmp(fnptr(p), filename, buflen) == 0)
            return p;
    }

    // LOGV("fail");

    return NULL;
}

void FS::forceGC(filename_filter filter) {
    lock();
    tryGC(0x7fff0000, filter);
    unlock();
}

bool FS::tryGC(int spaceNeeded, filename_filter filter) {
    int spaceLeft = (intptr_t)metaPtr - (intptr_t)freeDataPtr;

#ifdef RAFFS_TEST
    for (auto p = (uint32_t *)freeDataPtr; p < (uint32_t *)metaPtr; p++) {
        if (*p != M1) {
            LOG("value at %x = %x", OFF(p), *p);
            oopsAndClear();
        }
    }
#endif

    if (spaceLeft > spaceNeeded + 32)
        return true;
    
    int now = (int)system_timer_current_time();
    if (minGCSpacing) {
        gcHorizon += minGCSpacing;
        int nextGC = now - minGCSpacing * 2;
        // LOG("now=%d n=%d gch=%d", now, nextGC, gcHorizon);
        if (nextGC > gcHorizon)
            gcHorizon = nextGC;
        if (gcHorizon > now)
            target_panic(921);
    }

    LOG("running flash FS GC; needed %d, left %d", spaceNeeded, spaceLeft);

    readDirPtr = NULL;
    cachedMeta = NULL;

    auto newBase = (uintptr_t)altBasePtr();

    flushFlash();

    erasePages(newBase, bytes / 2);

    auto metaDst = (MetaEntry *)(newBase + bytes / 2);
    auto newBaseP = (uint8_t *)newBase;
    freeDataPtr = newBaseP + sizeof(FSHeader);

    for (int iter = 0; iter < 2; ++iter) {
        clearBlocked();
        auto offset = sizeof(FSHeader);
        for (auto p = metaPtr; p < endPtr; p++) {
            MetaEntry m = *p;
            const char *fn = fnptr(&m);

            if (filter && !filter(fn))
                continue;

            if (checkBlocked(&m) || m.dataptr == 0)
                continue;

            LOGV("GC %s sz=%d @%x", fn, m.datasize(), m.dataptr);
            auto fnlen = strlen(fn) + 1;
            auto sz = fnlen + m.datasize();

            if (iter == 0) {
                auto fd = freeDataPtr;
                writeData(fn, fnlen);
                writeData(basePtr + m.dataptr, m.datasize());
                if (freeDataPtr - fd != (int)sz)
                    oops();
            } else {
                m.fnptr = offset;
                m.dataptr = offset + fnlen;
                m._datasize &= ~RAFFS_FOLLOWING_MASK;
                writeBytes(--metaDst, &m, sizeof(m));
            }
            offset += sz;
        }
        if (iter == 0)
            finishWrite();
    }

    clearBlocked();
    flushFlash();

    LOG("GC done: %d free", (int)((intptr_t)metaDst - (intptr_t)freeDataPtr));

    FSHeader hd;
    hd.magic = RAFFS_MAGIC;
    hd.bytes = bytes;
    hd.numgc = ((FSHeader*)basePtr)->numgc + 1;
    hd.reserved = M1;
    writeBytes(newBaseP, &hd, sizeof(hd));
    flushFlash();

    basePtr = newBaseP;
    endPtr = (MetaEntry *)(newBase + bytes / 2);
    metaPtr = metaDst;

    if ((intptr_t)metaDst - (intptr_t)freeDataPtr <= spaceNeeded + 64) {
        if (filter != NULL && spaceNeeded != 0x7fff0000) {
            LOG("out of space! needed=%d", spaceNeeded);
#ifdef RAFFS_TEST
            oops();
#endif
        }
        return false;
    }

    return true;
}

DirEntry *FS::dirRead() {
    lock();

    if (readDirPtr == NULL) {
        readDirPtr = metaPtr;
        clearBlocked();
    }

    while (readDirPtr < endPtr) {
        auto m = *readDirPtr++;
        if (checkBlocked(&m) || m.dataptr == 0)
            continue;
        dirEnt.size = m.datasize();
        dirEnt.flags = 0;
        dirEnt.name = fnptr(&m);
        unlock();
        return &dirEnt;
    }

    readDirPtr = NULL;
    clearBlocked();
    unlock();
    return NULL;
}

uint16_t FS::writeData(const void *data, uint32_t len) {
    LOGVV("writeData: @%x %x:%x sz=%d", REAL_OFF(freeDataPtr), ((const uint8_t *)data)[0],
          ((const uint8_t *)data)[1], len);
    writeBytes(freeDataPtr, data, len);
    auto r = freeDataPtr - basePtr;
    freeDataPtr += len;
    return r;
}

void FS::finishWrite() {
    auto nfp = RAFFS_ROUND(freeDataPtr);
    int tailSz = nfp - (uintptr_t)freeDataPtr;
    uint64_t z = 0;
    if (tailSz) {
        writeData(&z, tailSz);
    } else {
        if (((uint32_t *)nfp)[-1] == M1)
            writeData(&z, 8);
    }
    flushFlash();
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