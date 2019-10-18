#include "RAFFS.h"
#define NS pxt::raffs

#include <string.h>
#include <stdio.h>

#include <vector>
using namespace std;

#define oops() assert(false)

#define MAX_WR 2000000

#define SZMULT 5

NS::FS *fs;

class FileCache {
  public:
    char name[64];
    bool del;
    bool visited;
    vector<uint8_t> data;

    void write(const void *buf, uint32_t len) {
        assert(len < MAX_WR);
        data.clear();
        uint8_t *ptr = (uint8_t *)buf;
        while (len--)
            data.push_back(*ptr++);
    }

    void validate() {
        assert(!del);

        int sz = fs->read(name, NULL, 0);
        if (sz != (int)data.size()) {
            LOG("failure size: %d != %d for %s", (int)sz, (int)data.size(), name);
            assert(false);
        }

        if (sz == 0)
            return;

        uint8_t buf[sz];
        int sz2 = fs->read(NULL, buf, sz);
        assert(sz == sz2);

        LOGV("validate: %s sz=%d %x:%x", name, sz, buf[0], buf[1]);

        for (int i = 0; i < sz; ++i) {
            if (buf[i] != data[i]) {
                LOG("failure: %d != %d at %d/%d", buf[i], data[i], i, sz);
                assert(false);
            }
        }
    }
};

vector<FileCache *> files;

#define SNORFS_PAGE_SIZE 256

class MemFlash : public codal::Flash {
    uint32_t npages;
    uint8_t *data;
    int erase(uint32_t addr, uint32_t len) {
        assert(addr % len == 0);
        assert(addr + len <= chipSize());
        for (uint32_t i = 0; i < len; ++i)
            data[addr + i] = 0xff;
        return 0;
    }

    uint8_t *allocData() {
        uintptr_t res = (uintptr_t) new uint8_t[chipSize() + SNORFS_PAGE_SIZE * 2];
        res = res & ~(SNORFS_PAGE_SIZE - 1);
        return (uint8_t *)res;
    }

    int writeBytesCore(uint32_t addr, const void *buffer, uint32_t len) {
        assert(len <= SNORFS_PAGE_SIZE);
        assert(addr / SNORFS_PAGE_SIZE == (addr + len - 1) / SNORFS_PAGE_SIZE);
        assert(addr + len <= chipSize());
        bytesWritten += len;
        numWrites++;
        uint8_t *ptr = (uint8_t *)buffer;

#ifdef SAMD51
        assert(len == 16);
        if (((uint64_t *)buffer)[0] != 0xffffffffffffffff)
            assert(((uint64_t *)(data + addr))[0] == 0xffffffffffffffff);
        if (((uint64_t *)buffer)[1] != 0xffffffffffffffff)
            assert(((uint64_t *)(data + addr))[1] == 0xffffffffffffffff);
#endif

        for (uint32_t i = 0; i < len; ++i) {
#ifdef CODAL_RAFFS_H
            if (*ptr != 0xff && (data[addr + i] & *ptr) != *ptr)
#else
            if (data[addr + i] != 0xff && !(data[addr + i] && *ptr == 0x00))
#endif
            {
                LOG("write error: addr=%d len=%d data[%d]=%d -> %d", addr, len, i, data[addr + i],
                    *ptr);
                assert(false);
            }
            if (*ptr != 0xff)
                data[addr + i] = *ptr;
            ptr++;
        }
        ticks += len * 3 + 50;
        return 0;
    }

    void eraseCore(uint32_t addr, uint32_t sz) {
        numErases++;
        if (snapshotBeforeErase) {
            snapshotBeforeErase = false;
            beforeErase = allocData();
            memcpy(beforeErase, data, chipSize());
        }
        ticks += sz * 10;
        erase(addr, sz);
    }

  public:
    MemFlash(int npages) {
        this->npages = npages;
        data = allocData();
        beforeErase = NULL;
        snapshotBeforeErase = false;

        bytesWritten = 0;
        numWrites = 0;
        numErases = 0;
        ticks = 0;
    }

    bool snapshotBeforeErase;
    uint8_t *beforeErase;
    int bytesWritten;
    int numWrites;
    int numErases;
    uint64_t ticks;

    void useSnapshot() {
        data = beforeErase;
        beforeErase = NULL;
    }

    uint32_t chipSize() { return npages * SNORFS_PAGE_SIZE; }

    int numPages() { return npages; }
    uintptr_t dataBase() { return (uintptr_t)data; }
    int writeBytes(uintptr_t addr, const void *buffer, uint32_t len) {
        return writeBytesCore(addr - dataBase(), buffer, len);
    }
    int pageSize(uintptr_t) { return SNORFS_PAGE_SIZE; }
    int erasePage(uintptr_t addr) {
        uint32_t off = addr - dataBase();
        assert((off & (SNORFS_PAGE_SIZE - 1)) == 0);
        eraseCore(off, SNORFS_PAGE_SIZE);
        return 0;
    }

    int eraseChip() { return erase(0, chipSize()); }
};

MemFlash flash(128 * 1024 / SNORFS_PAGE_SIZE);
uint8_t randomData[1024 * 1024 * 16];
uint32_t fileSeqNo;

const char *getFileName(uint32_t id) {
    static char namebuf[60];
    id *= 0x811c9dc5;
    const char *padding = "ABCDEFGHIJKLMNOPQR";
    snprintf(namebuf, sizeof(namebuf), "%x.%s.dat", id, padding + (id & 0xf));
    return namebuf;
}

FileCache *lookupFile(const char *fn, bool creat = true) {
    for (auto f : files) {
        if (strcmp(f->name, fn) == 0)
            return f;
    }
    if (!creat)
        return NULL;
    auto r = new FileCache();
    files.push_back(r);
    strcpy(r->name, fn);
    r->visited = false;
    return r;
}

uint8_t *getRandomData() {
    return randomData + rand() % (sizeof(randomData) - MAX_WR);
}


void remount() {
    delete fs;
    fs = new NS::FS(flash, flash.dataBase(), flash.chipSize());
}

void testAll() {
    for (auto fc : files) {
        if (fc->del) {
            assert(!fs->exists(fc->name));
        } else {
            fc->validate();
        }
    }
}

void testFF(int len, int rep) {
    auto fn = getFileName(++fileSeqNo);

    auto fc = lookupFile(fn);

    uint8_t buf[len];
    memset(buf, 0xff, len);

    while (rep--) {
        auto ll = rand() % len;
        fs->write(fn, buf, ll);
        fc->write(buf, ll);
        testAll();
        remount();
        testAll();
        if (rand() % 20 == 0)
            fs->forceGC();
    }
}

void simpleTest(const char *fn, int len, int rep = 1) {
    if (fn == NULL)
        fn = getFileName(++fileSeqNo);

    LOGV("\nsimpleTest(%s, %d, %d)", fn, len, rep);

    auto fc = lookupFile(fn);

    while (rep--) {
        auto data = getRandomData();
        fs->write(fn, data, len);
        fc->write(data, len);
        fc->validate();
    }
}


void multiTest(int nfiles, int blockSize, int reps) {
    LOGV("multi(%d,%d,%d)", nfiles, blockSize, reps);

    auto fcs = new FileCache *[nfiles];
    for (int i = 0; i < nfiles; ++i) {
        fcs[i] = lookupFile(getFileName(++fileSeqNo));
        fs->write(fcs[i]->name, NULL, 0);
    }
    reps *= nfiles;
    while (reps--) {
        int i = rand() % nfiles;
        auto d = getRandomData();
        auto len = (rand() % blockSize) + 1;
        fs->write(fcs[i]->name, d, len);
        fcs[i]->write(d, len);
        if (rand() % 20 == 0)
            testAll();
    }
    for (int i = 0; i < nfiles; ++i) {
        fcs[i]->validate();
    }
    for (int i = 0; i < nfiles; ++i) {
        fs->remove(fcs[i]->name);
        fcs[i]->del = true;
    }
}


int main() {
    for (uint32_t i = 0; i < sizeof(randomData); ++i)
        randomData[i] = rand();

    remount();
    assert(!fs->tryMount());

    fs->exists("foobar");

    assert(fs->tryMount());

    for (int i = 0; i < 5; ++i) {
        simpleTest("data.txt", 2);
        remount();
        testAll();
        if (i == 2) {
            fs->forceGC();
            testAll();
        }
    }

    fs->debugDump();
    for (int sz = 0; sz < 64; ++sz)
        simpleTest(NULL, sz);
    simpleTest(NULL, 200);
    simpleTest(NULL, 2000);

    LOG("one");

    testFF(17, 1000);

    LOG("before gc");
    testAll();

    fs->forceGC();
    LOG("after gc");
    testAll();

    auto bufFree = fs->freeSize();
    multiTest(50, 500, SZMULT);
    fs->forceGC();
    LOG("%d/%d", bufFree, fs->freeSize());
    assert(bufFree == fs->freeSize());

    testAll();

    LOG("two");

    multiTest(2, 1000, SZMULT);
    multiTest(10, 1000, SZMULT);
    for (int i = 0; i < 20; ++i)
        multiTest(10, 300, 2 * SZMULT);
    simpleTest(NULL, 1003, 3 * SZMULT);
    testAll();

    LOG("three");

    fs->forceGC();
    auto prevFree = fs->freeSize();
    auto iters = 1000; // more for stress testing
    multiTest(3, 300 * SZMULT, iters);
    multiTest(30, 30 * SZMULT, iters);
    auto diff = prevFree - fs->freeSize();
    fs->forceGC();
    printf("free: %d kb %d\n", fs->freeSize() / 1024, diff);
    testAll();

    fs->dump();

    // re-mount
    flash.snapshotBeforeErase = true;
    remount();
    fs->dump();
    testAll();

#ifndef CODAL_RAFFS_H
    printf("recovery!\n");
    flash.useSnapshot();
#endif

    remount();
    fs->dump();
    multiTest(30, 30 * SZMULT, iters);
    testAll();

    fs->dirRewind();
    NS::DirEntry *ent;
    for (auto f : files) {
        f->visited = false;
    }
    while ((ent = fs->dirRead()) != NULL) {
        auto fc = lookupFile(ent->name, false);
        if (!fc)
            oops();
        if (fc->del) {
            LOG("should be deleted: %s", fc->name);
            oops();
        }
        if (fc->visited) {
            LOG("already visited: %s", fc->name);
            oops();
        }
        if (fc->data.size() != ent->size) {
            LOG("size fail: %s exp %d got %d", fc->name, (int)fc->data.size(), ent->size);
            oops();
        }
        fc->visited = true;
        LOG("%8d %s", ent->size, ent->name);
    }
    for (auto f : files) {
        if (!f->visited && !f->del)
            oops();
    }

    printf("%dk written in %d writes. %d erases; %d s.\n", flash.bytesWritten / 1024,
           flash.numWrites, flash.numErases, (int)(flash.ticks * 7 / 10000000));
    printf("OK\n");

    return 0;
}
