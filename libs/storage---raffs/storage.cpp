#include "pxt.h"
#include "RAFFS.h"
#include "GhostFAT.h"

using namespace pxt::raffs;
using namespace codal;

namespace storage {

class PXTMSC : public GhostFAT {
  protected:
    raffs::FS &fs;
    raffs::File *currFile;
    GFATEntry *currEntry;

    static void readFile(GFATEntry *ent, unsigned blockAddr, char *dst);

  public:
    PXTMSC(raffs::FS &fs);
    virtual void addFiles();
    virtual const char *volumeLabel() { return "MAKECODE"; }
};

#define BOOTLOADER_START 0x08000000
#define BOOTLOADER_END 0x08008000

static void readCfg(GFATEntry *, unsigned blockAddr, char *dst) {
  memcpy(dst, (void *)(BOOTLOADER_START + blockAddr * 512), 512);
}

PXTMSC::PXTMSC(FS &fs) : fs(fs) {
    currFile = NULL;
    currEntry = NULL;
}

void PXTMSC::readFile(GFATEntry *ent, unsigned blockAddr, char *dst) {
    auto th = (PXTMSC *)ent->userdata;

    if (th->currEntry != ent) {
        th->currEntry = ent;
        if (th->currFile)
            delete th->currFile;
        th->currFile = th->fs.open(ent->filename);
    }

    th->currFile->seek(blockAddr * 512);
    th->currFile->read(dst, 512);
}

void PXTMSC::addFiles() {
    // reading SPI directory can take some time, so we delay USB start
    CodalUSB::usbInstance->delayStart();

    GhostFAT::addFiles();

    // rename info_uf2.txt to info_xf2.txt, so that the drive is not detected as one accepting UF2 files
    for (auto f = files; f; f = f->next) {
        if (strcmp(f->filename, "info_uf2.txt") == 0)
            f->filename[5] = 'x';
    }

    addFile(readCfg, this, "config.bin", BOOTLOADER_END - BOOTLOADER_START);

    addDirectory(20, "FLASH");

    fs.dirRewind();
    auto d = fs.dirRead();
    while (d) {
        if (!strstr(d->name, "$"))
            addFile(readFile, this, d->name, d->size, 20);
        d = fs.dirRead();
    }

    CodalUSB::usbInstance->start();
}

class WStorage {
  public:
    CODAL_FLASH flash;
    FS fs;
    PXTMSC msc;

    // maybe we want to keep say up to 5 files open?
    String currFilename;
    raffs::File *currFile;

    bool isMounted;

    WStorage() : flash(), 
#ifdef STM32F4
    fs(flash, 0x8008000, 32 * 1024),
#else
    fs(flash),     
#endif
    msc(fs)
    {
        isMounted = false;
        currFile = NULL;
        currFilename = NULL;
        registerGC((TValue *)&currFilename);
    }
};
SINGLETON(WStorage);

static WStorage *mountedStorage() {
    auto s = getWStorage();
    if (s->fs.tryMount())
        return s;
    s->fs.exists("foobar"); // forces mount and possibly format
    return s;
}

//%
void init() {
    usb.delayStart();
    auto s = getWStorage();
    if (s) {
        usb.add(s->msc);
        s->msc.addFiles();
    }
    usb.start();
}

raffs::File *getFile(String filename) {
    auto st = mountedStorage();
    if (!st)
        return NULL;

    if (st->currFilename) {
        if (filename && String_::compare(st->currFilename, filename) == 0)
            return st->currFile;
        decrRC(st->currFilename);
        delete st->currFile;
    }
    st->currFilename = filename;
    incrRC(st->currFilename);
    // TODO: fix UTF8 encoding
    st->currFile = filename == NULL ? NULL : st->fs.open(filename->getUTF8Data());
    return st->currFile;
}

/**
 * Append a buffer to a new or existing file.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
int _appendBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    if (NULL == f)
        return -1;
    return f->append(data->data, data->length);
}

/**
 * Overwrite file with a buffer.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
int _overwriteWithBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    if (NULL == f)
        return -1;
    return f->overwrite(data->data, data->length);
}

/**
 * Return true if the file already exists.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
//% blockId="storage_exists" block="file $filename exists"
bool exists(String filename) {
    auto st = mountedStorage();
    return !!st && st->fs.exists(filename->getUTF8Data());
}

/**
 * Delete a file, or do nothing if it doesn't exist.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
//% blockId="storage_remove" block="remove file $filename"
void remove(String filename) {
    if (!exists(filename))
        return;
    auto f = getFile(filename);
    f->del();
    getFile(NULL);
}

/**
 * Return the size of the file, or -1 if it doesn't exists.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
//% blockId="storage_size" block="size of file $filename"
int size(String filename) {
    if (!exists(filename))
        return -1;
    auto f = getFile(filename);
    return f->size();
}

/**
 * Read contents of file as a buffer.
 * @param filename name of the file, eg: "log.txt"
 */
//% parts="storage"
Buffer readAsBuffer(String filename) {
    auto f = getFile(filename);
    if (NULL == f)
        return NULL;
    auto sz = f->size();
    if (sz > 0xffff)
        return NULL;
    auto res = mkBuffer(NULL, sz);
    f->seek(0);
    f->read(res->data, res->length);
    return res;
}


//%
RefCollection *_list() {
    auto st = mountedStorage();
    st->fs.dirRewind();
    auto res = Array_::mk();
    for (;;) {
        auto d = st->fs.dirRead();
        if (!d)
            break;
        res->head.push((TValue)mkString(d->name, -1));
    }
    return res;
}


} // namespace storage
