
#include "pxt.h"
#include "RAFFS.h"
#include "GhostFAT.h"

using namespace pxt::raffs;
using namespace codal;

namespace settings {

class WStorage {
  public:
    CODAL_FLASH flash;
    FS fs;
    bool isMounted;

    WStorage() : flash(), 
#if defined(STM32F4)
    fs(flash, 0x8008000, 32 * 1024),
#elif defined(SAMD51)
    fs(flash, 512*1024 - 32*1024, 32 * 1024),
#else
    fs(flash),
#endif
    isMounted(false)
    {
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
    auto sz = s->fs.read(key->getUTF8Data());
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
    s->fs.forceGC(isSystem);
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
