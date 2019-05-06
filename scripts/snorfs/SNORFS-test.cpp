#include "SNORFS.h"

#include <string.h>
#include <stdio.h>

#include <vector>
using namespace std;

#define oops() assert(false)

#define MAX_WR 2000000

#ifdef CODAL_RAFFS_H
#define SZMULT 5
#else
#define SZMULT 100
#endif

typedef codal::snorfs::File File;
codal::snorfs::FS *fs;

class FileCache {
  public:
    char name[64];
    bool del;
    bool visited;
    vector<uint8_t> data;

    void append(const void *buf, uint32_t len) {
        assert(len < MAX_WR);
        uint8_t *ptr = (uint8_t *)buf;
        while (len--)
            data.push_back(*ptr++);
    }

    void validate(File *f) {
        uint8_t tmp[512];
        bool align = false;
        f->seek(0);
        uint32_t ptr = 0;

        assert(!del);

        while (ptr < data.size()) {
            assert(ptr == f->tell());

            size_t len;

            if (align) {
                len = 256;
                align = false;
            } else if (rand() % 3 == 0) {
                len = 256 - (ptr & 0xff);
                if (len == 0)
                    len = 256;
                align = true;
            } else {
                len = rand() % 500 + 1;
            }
            len = min(data.size() - ptr, len);

            memset(tmp, 0, sizeof(tmp));

            int l = f->read(tmp, len);
            f->debugDump();
            LOGV("read len=%d l=%d at %d / %x %x %x %x", (int)len, l, ptr, tmp[0], tmp[1], tmp[2],
                 tmp[3]);
            assert(l == (int)len);
            for (unsigned i = 0; i < len; ++i) {
                if (tmp[i] != data[ptr + i]) {
                    LOG("failure: %d != %d at %d (i=%d)", tmp[i], data[ptr + i], ptr + i, i);
                    assert(false);
                }
            }
            ptr += len;
        }
        int l = f->read(tmp, 1);
        assert(l == 0);

        // test reading random ranges
        int ranges = 5;
        while (ranges--) {
            int start = rand() % data.size();
            size_t len = rand() % 512;
            len = min(len, data.size() - start);
            f->seek(start);
            f->read(tmp, len);
            for (unsigned i = 0; i < len; ++i) {
                if (tmp[i] != data[start + i]) {
                    f->debugDump();
                    LOG("tmp[%d]=%d data[%d + %d]=%d", i, tmp[i], start, i, data[start + i]);
                    assert(false);
                }
            }
        }
    }
};

vector<FileCache *> files;

class MemFlash :
#ifdef CODAL_RAFFS_H
    public codal::Flash
#define SNORFS_PAGE_SIZE 256
#else
    public codal::SPIFlash
#endif
{
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

#ifdef CODAL_RAFFS_H
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
#else
    int readBytes(uint32_t addr, void *buffer, uint32_t len) {
        assert(addr + len <= chipSize());
        assert(len <= SNORFS_PAGE_SIZE); // needed?
        memcpy(buffer, data + addr, len);
        ticks += 5 + len;
        return 0;
    }
    int writeBytes(uint32_t addr, const void *buffer, uint32_t len) {
        return writeBytesCore(addr, buffer, len);
    }
    int eraseSmallRow(uint32_t addr) {
        assert(false);
        return erase(addr, SPIFLASH_SMALL_ROW_SIZE);
    }
    int eraseBigRow(uint32_t addr) { return eraseCore(addr, SPIFLASH_BIG_ROW_SIZE); }
#endif
    int eraseChip() { return erase(0, chipSize()); }
};

File *mk(const char *fn) {
    auto r = fs->open(fn);
    assert(r != NULL);
    return r;
}

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

void simpleTest(const char *fn, int len, int rep = 1) {
    if (fn == NULL)
        fn = getFileName(++fileSeqNo);

    LOGV("\nsimpleTest(%s, %d, %d)", fn, len, rep);

    auto fc = lookupFile(fn);

    auto f = mk(fn);
    while (rep--) {
        auto data = getRandomData();
        f->append(data, len);
        if (rep % 32 == 7) {
            LOGV("reopen");
            delete f;
            f = mk(fn);
        }
        fc->append(data, len);
    }

    fc->validate(f);
    delete f;

    LOGV("\nAgain.");

    f = mk(fn);
    fc->validate(f);
    delete f;
}

void multiTest(int nfiles, int blockSize, int reps, bool over = false) {
    LOGV("multi(%d,%d,%d)", nfiles, blockSize ,reps);

    auto fs = new File *[nfiles];
    auto fcs = new FileCache *[nfiles];
    for (int i = 0; i < nfiles; ++i) {
        fcs[i] = lookupFile(getFileName(++fileSeqNo));
        fs[i] = mk(fcs[i]->name);
    }
    reps *= nfiles;
    while (reps--) {
        int i = rand() % nfiles;
        auto d = getRandomData();
        auto len = (rand() % blockSize) + 1;
        if (over) {
            fs[i]->overwrite(d, len);
            fcs[i]->data.clear();
        } else {
            fs[i]->append(d, len);
        }
        fcs[i]->append(d, len);
    }
    for (int i = 0; i < nfiles; ++i) {
        fcs[i]->validate(fs[i]);
    }
    for (int i = 0; i < nfiles; ++i) {
        if (over || rand() % 10 != 0) {
            fs[i]->del();
            fcs[i]->del = true;
        }
        delete fs[i];
    }
}

void testBuf() {
    File *fs[] = {mk("buffer.dat"), mk("buffer.dat"), mk("buffer.dat")};
    int readP[] = {0, 0, 0};
    int writeP = 0;
    while (writeP < 10240 * SZMULT) {
        auto f = fs[rand() % 3];
        assert((int)f->size() == writeP);
        int len = rand() % 2000 + 100;
        f->append(randomData + writeP, len);
        writeP += len;

        for (int i = 0; i < 3; ++i) {
            int len2 = rand() % 2000 + 100;
            char buf[len2];
            f = fs[i];
            int rdlen = f->read(buf, len2);
            if (memcmp(randomData + readP[i], buf, rdlen))
                assert(false);
            readP[i] += rdlen;
            assert(readP[i] == writeP || rdlen == len2);
        }
    }
    fs[0]->del();
}

void testAll() {
    for (auto fc : files) {
        if (fc->del) {
            assert(!fs->exists(fc->name));
        } else {
            auto f = fs->open(fc->name, false);
            assert(!!f);
            fc->validate(f);
            delete f;
        }
    }
}

codal::snorfs::FS *mkFS(MemFlash &flash) {
#ifdef CODAL_RAFFS_H
    return new codal::snorfs::FS(flash, flash.dataBase(), flash.chipSize());
#else
    return new codal::snorfs::FS(flash);
#endif
}

int main() {
    for (uint32_t i = 0; i < sizeof(randomData); ++i)
        randomData[i] = rand();
#ifdef CODAL_RAFFS_H
    MemFlash flash(250 * 1024 / SNORFS_PAGE_SIZE);
#else
    MemFlash flash(2 * 1024 * 1024 / SNORFS_PAGE_SIZE);
#endif

    fs = mkFS(flash);
    assert(!fs->tryMount());
#ifndef CODAL_RAFFS_H
    flash.eraseChip();
    assert(fs->tryMount());
#endif
    for (int i = 0; i < 5; ++i) {
        simpleTest("data.txt", 2);
        fs = mkFS(flash);
        testAll();
    }

    fs->debugDump();
    simpleTest(NULL, 1000);
    simpleTest(NULL, 256);
    simpleTest(NULL, 10000);

    LOG("one");

    fs->forceGC();
    auto bufFree = fs->freeSize();
    testBuf();
    fs->forceGC();
    assert(bufFree == fs->freeSize());

    simpleTest(NULL, 3000 * SZMULT);
    simpleTest(NULL, 100, 20);
    simpleTest(NULL, 128, 20);
    simpleTest(NULL, 128, 20 * SZMULT);
    simpleTest(NULL, 13, 20 * SZMULT);
    simpleTest(NULL, 10 * SZMULT + 3, 20);

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
    multiTest(3, 300 * SZMULT, iters, true);
    multiTest(30, 30 * SZMULT, iters, true);
    auto diff = prevFree - fs->freeSize();
    fs->forceGC();
    printf("free: %d kb %d\n", fs->freeSize() / 1024, diff);
    testAll();

    fs->dump();

    // re-mount
    flash.snapshotBeforeErase = true;
    fs = mkFS(flash);
    fs->dump();
    testAll();

    printf("recovery!\n");

    flash.useSnapshot();
    fs = mkFS(flash);
    fs->dump();
    multiTest(30, 3000, iters, true);
    testAll();

    fs->dirRewind();
    codal::snorfs::DirEntry *ent;
    while ((ent = fs->dirRead()) != NULL) {
        auto fc = lookupFile(ent->name, false);
        if (!fc)
            oops();
        if (fc->data.size() != ent->size)
            oops();
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
