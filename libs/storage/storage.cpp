#include "pxt.h"

#if CONFIG_ENABLED(DEVICE_USB)

#include "MbedSPI.h"
#include "MSCSNORFS.h"
#include "StandardSPIFlash.h"

namespace storage {

class WStorage {
  public:
    CODAL_MBED::SPI flashSPI;
    StandardSPIFlash flash;
    snorfs::FS fs;
    snorfs::MSC msc;

    WStorage()
        : flashSPI(*LOOKUP_PIN(FLASH_MOSI), *LOOKUP_PIN(FLASH_MISO), *LOOKUP_PIN(FLASH_SCK)),
          flash(flashSPI, *LOOKUP_PIN(FLASH_CS),
                getConfig(CFG_FLASH_BYTES, 2 * 1024 * 1024) / SPIFLASH_PAGE_SIZE),
          fs(flash), msc(fs) {}
};
SINGLETON(WStorage);

//%
void init() {
    usb.add(getWStorage()->msc);
    getWStorage()->msc.addFiles();
}

snorfs::File *getFile(String filename) {
    // maybe we want to keep say up to 5 files open?
    static String currFilename;
    static snorfs::File *currFile;
    if (currFilename) {
        if (filename && String_::compare(currFilename, filename) == 0)
            return currFile;
        decrRC(currFilename);
        delete currFile;
    }
    currFilename = filename;
    incrRC(currFilename);
    currFile = filename == NULL ? NULL : getWStorage()->fs.open(filename->data);
    return currFile;
}

/** Append string data to a new or existing file. */
//%
void append(String filename, String data) {
    auto f = getFile(filename);
    f->append(data->data, data->length);
}

/** Append a buffer to a new or existing file. */
//%
void appendBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    f->append(data->data, data->length);
}

/** Overwrite file with string data. */
//%
void overwrite(String filename, String data) {
    auto f = getFile(filename);
    f->overwrite(data->data, data->length);
}

/** Overwrite file with a buffer. */
//%
void overwriteWithBuffer(String filename, Buffer data) {
    auto f = getFile(filename);
    f->overwrite(data->data, data->length);
}

/** Return true if the file already exists. */
//%
bool exists(String filename) {
    return getWStorage()->fs.exists(filename->data);
}

/** Delete a file, or do nothing if it doesn't exist. */
//%
void remove(String filename) {
    if (!exists(filename))
        return;
    auto f = getFile(filename);
    f->del();
    getFile(NULL);
}

/** Return the size of the file, or -1 if it doesn't exists. */
//%
int size(String filename) {
    if (!exists(filename))
        return -1;
    auto f = getFile(filename);
    return f->size();
}

/** Read contents of file as a string. */
//%
String read(String filename) {
    auto f = getFile(filename);
    auto sz = f->size();
    if (sz > 0xffff)
        return NULL;
    auto res = mkString(NULL, sz);
    f->seek(0);
    f->read(res->data, res->length);
    return res;
}

/** Read contents of file as a buffer. */
//%
Buffer readAsBuffer(String filename) {
    auto f = getFile(filename);
    auto sz = f->size();
    if (sz > 0xffff)
        return NULL;
    auto res = mkBuffer(NULL, sz);
    f->seek(0);
    f->read(res->data, res->length);
    return res;
}

} // namespace storage
#endif