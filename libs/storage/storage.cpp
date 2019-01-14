#include "pxt.h"
#include "SPI.h"

#include "GhostSNORFS.h"
#include "StandardSPIFlash.h"

namespace storage {

class PXTMSC : public GhostSNORFS {
  public:
    virtual const char *volumeLabel() { return "MAKECODE"; }
    PXTMSC(snorfs::FS &fs) : GhostSNORFS(fs) {}
};

class WStorage {
  public:
    CODAL_SPI flashSPI;
    StandardSPIFlash flash;
    snorfs::FS fs;
    PXTMSC msc;
    bool mounted;

    WStorage()
        : flashSPI(*LOOKUP_PIN(FLASH_MOSI), *LOOKUP_PIN(FLASH_MISO), *LOOKUP_PIN(FLASH_SCK)),
          flash(flashSPI, *LOOKUP_PIN(FLASH_CS),
                getConfig(CFG_FLASH_BYTES, 2 * 1024 * 1024) / SNORFS_PAGE_SIZE),
          fs(flash), msc(fs) {
        // see if we can mount it
        mounted = fs.tryMount();
    }
};
SINGLETON(WStorage);

static WStorage *mountedStorage() {
    auto s = getWStorage();
    if (s->mounted)
        return s;

    auto p = LOOKUP_PIN(LED);
    // lock-up blinking LED
    // TODO wait for A+B, erase SPI chip, and reset
    while (1) {
        p->setDigitalValue(1);
        fiber_sleep(100);
        p->setDigitalValue(0);
        fiber_sleep(100);
    }
}

//%
void init() {
    usb.delayStart();
    auto s = getWStorage();
    if (s->mounted) {
        usb.add(s->msc);
        s->msc.addFiles();
    }
    usb.start();
}

snorfs::File *getFile(String filename) {
    auto st = mountedStorage();

    // maybe we want to keep say up to 5 files open?
    static String currFilename;
    static snorfs::File *currFile;

    if (!currFilename) {
        registerGC((TValue*)&currFilename);
    } else {
        if (filename && String_::compare(currFilename, filename) == 0)
            return currFile;
        decrRC(currFilename);
        delete currFile;
    }
    currFilename = filename;
    incrRC(currFilename);
    // TODO: fix UTF8 encoding
    currFile = filename == NULL ? NULL : st->fs.open(filename->getUTF8Data());
    return currFile;
}

/** 
* Append a buffer to a new or existing file. 
* @param filename name of the file, eg: "log.txt"
*/
//% parts="storage"
void appendBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    if (NULL == f) return;
    f->append(data->data, data->length);
}

/** 
* Overwrite file with a buffer. 
* @param filename name of the file, eg: "log.txt"
*/
//% parts="storage"
void overwriteWithBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    if (NULL == f) return;
    f->overwrite(data->data, data->length);
}

/** 
* Return true if the file already exists. 
* @param filename name of the file, eg: "log.txt"
*/
//% parts="storage"
//% blockId="storage_exists" block="file $filename exists"
bool exists(String filename) {
    // TODO utf8 encoding
    return mountedStorage()->fs.exists(filename->getUTF8Data());
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

} // namespace storage
