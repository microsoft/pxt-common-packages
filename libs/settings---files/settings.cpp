#define _GNU_SOURCE 1

#include "pxt.h"

#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>
#include <errno.h>

#define FAIL(msg)                                                                                  \
    do {                                                                                           \
        DMESG("FAILURE: %s", msg);                                                                 \
        abort();                                                                                   \
    } while (0)

namespace settings {

#define ADD(c)                                                                                     \
    do {                                                                                           \
        buf[dp] = (c);                                                                             \
        dp++;                                                                                      \
        if (dp > 1000)                                                                             \
            FAIL("too long");                                                                      \
    } while (0)

const char *hexD = "0123456789abcdef";

static char *encodeString(const char *str) {
    static char buf[1024];
    int dp = 0;
    for (auto sp = str; *sp; ++sp) {
        auto c = *sp;
        if (('0' <= c && c <= '9') || ('a' <= c && c <= 'z'))
            ADD(c);
        else if (('A' <= c && c <= 'Z')) {
            ADD('-');
            ADD(c | 0x20);
        } else {
            ADD('_');
            ADD(hexD[(c >> 4) & 0xf]);
            ADD(hexD[c & 0xf]);
        }
    }

    ADD(0);

    return buf;
}

static int hex(char c) {
    if ('0' <= c && c <= '9')
        return c - '0';
    c |= 0x20;
    if ('a' <= c && c <= 'f')
        return c - 'a' + 10;
    return -1;
}

static char *decodeString(const char *str) {
    static char buf[1024];
    int dp = 0;

    if (strlen(str) > 1000)
        FAIL("too long decode");

    for (auto sp = str; *sp; ++sp) {
        auto c = *sp;
        if (('0' <= c && c <= '9') || ('a' <= c && c <= 'z'))
            ADD(c);
        else if (c == '-' && sp[1]) {
            ADD(sp[1] & ~0x20);
            sp++;
        } else if (c == '_' && hex(sp[1]) >= 0 && hex(sp[2]) >= 0) {
            ADD((hex(sp[1]) << 4) | hex(sp[2]));
            sp += 2;
        }
    }

    ADD(0);

    return buf;
}

static const char *settingsDirectory() {
    static char *name;
    if (name)
        return name;
#ifdef SETTINGSDIR
    asprintf(&name, "%s/%s", SETTINGSDIR, encodeString(programName()->getUTF8Data()));
#else
    asprintf(&name, "%s.data", initialArgv[0]);
#endif
#ifdef __WIN32__
    mkdir(name);
#else
    mkdir(name, 0777);
#endif
    return name;
}

static const char *keyName(const char *key) {
    static char *lastName;
    if (lastName)
        free(lastName);
    auto dirname = settingsDirectory();
    asprintf(&lastName, "%s/%s", dirname, encodeString(key));
    return lastName;
}

static const char *keyName(String key) {
    return keyName(key->getUTF8Data());
}

static FILE *openKey(String key, const char *mode) {
    return fopen(keyName(key), mode);
}

//%
int _set(String key, Buffer data) {
    // DMESG("set[%s] - %p", key->getUTF8Data(), data);
    auto f = openKey(key, "wb");
    if (!f) {
        DMESG("errno=%d", errno);
        FAIL("can't write file");
    }
    fwrite(data->data, data->length, 1, f);
    fclose(f);
    return 0;
}

//%
int _remove(String key) {
    return remove(keyName(key));
}

//%
bool _exists(String key) {
    auto f = openKey(key, "rb");
    fclose(f);
    return f != NULL;
}

//%
Buffer _get(String key) {
    auto f = openKey(key, "rb");
    if (f == NULL)
        return NULL;
    fseek(f, 0, SEEK_END);
    auto sz = ftell(f);
    auto ret = mkBuffer(NULL, sz);
    registerGCObj(ret);
    fseek(f, 0, SEEK_SET);
    fread(ret->data, ret->length, 1, f);
    fclose(f);
    unregisterGCObj(ret);
    return ret;
}

//%
void _userClean() {
    auto dp = opendir(settingsDirectory());
    if (!dp)
        return;
    for (;;) {
        dirent *ep = readdir(dp);
        if (!ep)
            break;
        auto name = decodeString(ep->d_name);
        if (name[0] == '#')
            continue;
        remove(keyName(name));
    }
    closedir(dp);
}

//%
RefCollection *_list(String prefix) {
    auto res = Array_::mk();
    registerGCObj(res);

    auto prefData = prefix->getUTF8Data();
    auto prefLen = prefix->getUTF8Size();
    auto wantsInternal = prefData[0] == '#';

    auto dp = opendir(settingsDirectory());

    for (;;) {
        dirent *ep = dp ? readdir(dp) : NULL;
        if (!ep)
            break;
        auto name = decodeString(ep->d_name);
        if (!wantsInternal && name[0] == '#')
            continue;
        if (memcmp(name, prefData, prefLen) != 0)
            continue;
        auto str = mkString(name, -1);
        registerGCObj(str);
        res->head.push((TValue)str);
        unregisterGCObj(str);
    }
    if (dp)
        closedir(dp);
    unregisterGCObj(res);

    return res;
}

} // namespace settings
