#include "SPI.h"
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

}