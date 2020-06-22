
#include "pxt.h"
#include "RAFFS.h"
#include "GhostFAT.h"

using namespace pxt::raffs;
using namespace codal;

namespace settings {

#if defined(SAMD21)
#define SETTINGS_SIZE (2 * 1024)
#else
#define SETTINGS_SIZE (32 * 1024)
#endif

class WStorage {
  public:
    CODAL_FLASH flash;
    FS fs;
    bool isMounted;

    WStorage()
        : flash(),
#if defined(STM32F4)
          fs(flash, 0x8008000, SETTINGS_SIZE),
#elif defined(SAMD51)
          fs(flash, 512 * 1024 - SETTINGS_SIZE, SETTINGS_SIZE),
#elif defined(SAMD21)
          fs(flash, 256 * 1024 - SETTINGS_SIZE, SETTINGS_SIZE),
#elif defined(NRF52_SERIES)
#define NRF_BOOTLOADER_START *(uint32_t *)0x10001014
          fs(flash,
             128 * 1024 < NRF_BOOTLOADER_START && NRF_BOOTLOADER_START < (uint32_t)flash.totalSize()
                 ? NRF_BOOTLOADER_START - SETTINGS_SIZE
                 : flash.totalSize() - SETTINGS_SIZE,
             SETTINGS_SIZE),
#else
          fs(flash),
#endif
          isMounted(false) {
        fs.minGCSpacing = 10000;
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
int _set(String key, Buffer data) {
    auto s = mountedStorage();
    return s->fs.write(key->getUTF8Data(), data->data, data->length);
}

//%
int _remove(String key) {
    auto s = mountedStorage();
    return s->fs.remove(key->getUTF8Data());
}

//%
bool _exists(String key) {
    auto s = mountedStorage();
    return s->fs.exists(key->getUTF8Data());
}

//%
Buffer _get(String key) {
    auto s = mountedStorage();
    auto sz = s->fs.read(key->getUTF8Data(), NULL, 0);
    if (sz < 0)
        return NULL;
    auto ret = mkBuffer(NULL, sz);
    registerGCObj(ret);
    s->fs.read(NULL, ret->data, ret->length);
    unregisterGCObj(ret);
    return ret;
}

static bool isSystem(const char *fn) {
    return fn[0] == '#';
}

//%
void _userClean() {
    auto s = mountedStorage();
    DMESG("clearing user files");
    s->fs.forceGC(isSystem);
    // if system files take more than 25% of storage size, we reformat
    // it likely means user code has written some 'system' files
    if (s->fs.freeSize() < 3 * s->fs.totalSize() / 4) {
        s->fs.format();
    }
}

//%
RefCollection *_list(String prefix) {
    auto st = mountedStorage();
    st->fs.dirRewind();
    auto res = Array_::mk();
    registerGCObj(res);

    auto prefData = prefix->getUTF8Data();
    auto prefLen = prefix->getUTF8Size();
    auto wantsInternal = prefData[0] == '#';

    for (;;) {
        auto d = st->fs.dirRead();
        if (!d)
            break;
        if (!wantsInternal && d->name[0] == '#')
            continue;
        if (memcmp(d->name, prefData, prefLen) != 0)
            continue;
        auto str = mkString(d->name, -1);
        registerGCObj(str);
        res->head.push((TValue)str);
        unregisterGCObj(str);
    }
    unregisterGCObj(res);
    return res;
}

} // namespace settings
