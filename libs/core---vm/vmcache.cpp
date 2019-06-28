#include "pxt.h"
#include <dirent.h>
#include <stdio.h>
#include <ctype.h>
#include <dirent.h>
#include <sys/stat.h>
#include <time.h>

namespace vmcache {

static char *dataPath;

#define OFFSET_OF(structName, field) ((uintptr_t)(&((structName *)NULL)->field) - (uintptr_t)NULL)

struct FullHeader {
    VMImageSection sect;
    VMImageHeader header;
};


static char *scriptPath(const char *scriptId) {
    for (auto p = scriptId; *p; ++p)
        if (!isalnum(*p) && *p != '-' && *p != '_') {
            dmesg("invalid scriptId: %s at '%c'", scriptId, *p);
            return NULL;
        }
    auto baseLen = strlen(dataPath);
    auto idLen = strlen(scriptId);
    auto pathBuf = (char *)malloc(baseLen + 20 + idLen);
    strcpy(pathBuf, dataPath);
    strcat(pathBuf, "/scripts-v0");
    if (*scriptId) {
        strcat(pathBuf, "/");
        strcat(pathBuf, scriptId);
    }
    return pathBuf;
}

DLLEXPORT void pxt_vm_set_data_directory(const char *path) {
    free(dataPath);
    dataPath = strdup(path);
    dmesg("set vm cached dir %s", dataPath);
}

int checkCache(const char *scriptId, bool updateTimestamp = true) {
    auto pathBuf = scriptPath(scriptId);
    if (!pathBuf)
        return 0;
    auto fh = fopen(pathBuf, updateTimestamp ? "r+b" : "rb");
    free(pathBuf);
    dmesg("cache %s for %s", fh ? "hit" : "miss", scriptId);
    if (fh) {
        if (updateTimestamp) {
            fseek(fh, OFFSET_OF(FullHeader, header.lastUsageTime), SEEK_SET);
            int64_t now = time(NULL);
            fwrite(&now, 1, 8, fh);
        }
        fclose(fh);
        return 1;
    }
    return 0;
}

DLLEXPORT int pxt_vm_cache_hit(const char *scriptId) {
    return checkCache(scriptId, false);
}

static int isValidHeader(FullHeader *fh) {
    auto hd = &fh->header;
    return fh->sect.type == SectionType::InfoHeader && fh->sect.size >= sizeof(FullHeader) &&
           hd->magic0 == VM_MAGIC0 && hd->magic1 == VM_MAGIC1;
}

static int readHeader(const char *filepath, FullHeader *fh) {
    memset(fh, 0, sizeof(*fh));
    if (!filepath)
        return 0;

    auto fp = fopen(filepath, "rb");
    int sz = 0;
    if (fp != NULL) {
        sz = (int)fread(fh, 1, sizeof(*fh), fp);
        fclose(fp);
    }
    if (sz <= (int)sizeof(*fh))
        return 0;
    return 1;
}

static const char *readEntry(DIR *dp, FullHeader *hd) {
    if (!dp)
        return NULL;

    for (;;) {
        struct dirent *de = readdir(dp);
        if (!de) {
            closedir(dp);
            return NULL;
        }

        if (de->d_name[0] == '.')
            continue;

        auto filepath = scriptPath(de->d_name);
        readHeader(filepath, hd);
        free(filepath);

        if (!isValidHeader(hd))
            continue;

        hd->header.name[127] = 0; // make sure it's NUL terminated

        return de->d_name;
    }
}

static DIR *openCacheDir() {
    auto dirpath = scriptPath("");
    auto dp = opendir(dirpath);
    free(dirpath);
    return dp;
}

static bool nameExists(const char *name) {
    auto dp = openCacheDir();
    FullHeader fh;
    for (;;) {
        if (!readEntry(dp, &fh))
            break;
        if (strcmp(name, (char*)fh.header.name) == 0)
            return true;
    }
    return false;
}

//%
RefCollection *list() {
    auto res = Array_::mk();
    registerGCObj(res);

    auto dp = openCacheDir();
    FullHeader fh;
    for (;;) {
        auto id = readEntry(dp, &fh);
        if (!id)
            break;
        char buf[1024];
        for (auto p = fh.header.name; *p; p++) {
            if (*p == '\"' || *p < 32)
                *p = '_';
        }
        snprintf(buf, 1023,
                 "{ \"id\": \"%s\", \"pubTime\": %lld, \"installTime\": %lld, \"usageTime\": %lld, "
                 "\"name\": \"%s\" }",
                 id, fh.header.publicationTime, fh.header.installationTime, fh.header.lastUsageTime,
                 fh.header.name);
        auto str = mkString(buf, -1);
        registerGCObj(str);
        Array_::push(res, (TValue)str);
        unregisterGCObj(str);
    }

    unregisterGCObj(res);
    return res;
}

static int renameImage(uint8_t *data, int len) {
    FullHeader *fh = (FullHeader *)data;
    if (len < (int)sizeof(FullHeader))
        return -1;
    if (!isValidHeader(fh))
        return -2;
    fh->header.installationTime = (int64_t)time(NULL);
    auto name = (char*)fh->header.name;
    name[101] = 0; // make sure we have space at the end
    dmesg("rename image from '%s'", name);
    if (nameExists(name)) {
        int namelen = (int)strlen(name);
        for (int i = 2; i <= 99; ++i) {
            snprintf(name + namelen, 6, " (%d)", i);
            if (!nameExists(name))
                break;
        }
        dmesg("renamed to '%s'", name);
    } else {
        dmesg("rename not needed");
    }
    return 0;
}

DLLEXPORT int pxt_vm_save_in_cache(const char *scriptId, uint8_t *data, int len) {
    if (!dataPath || len < 256)
        return -1;
    auto dp = scriptPath("");
#ifdef __WIN32__
    mkdir(dp);
#else
    mkdir(dp, 0777);
#endif
    free(dp);
    auto pathBuf = scriptPath(scriptId);
    if (!pathBuf)
        return -3;
    if (renameImage(data, len))
        return -4;
    auto fh = fopen(pathBuf, "wb");
    dmesg("saving %s in cache, %d bytes", pathBuf, len);
    free(pathBuf);
    if (!fh)
        return -2;
    fwrite(data, len, 1, fh);
    fclose(fh);
    dmesg("saved.");
    return 0;
}

DLLEXPORT void pxt_vm_start(const char *fn);

DLLEXPORT int pxt_vm_cache_start(const char *scriptId) {
    if (!checkCache(scriptId))
        return -1;
    auto pathBuf = scriptPath(scriptId);
    dmesg("starting %s from cache", pathBuf);
    pxt_vm_start(pathBuf);
    return 0;
}

//%
void run(String name) {
    auto scriptId = name->getUTF8Data();
    if (!checkCache(scriptId))
        return;
    auto pathBuf = scriptPath(scriptId);
    dmesg("starting %s from cache from VM code", pathBuf);
    vmStartFromUser(pathBuf);
}

//%
void del(String name) {
    auto scriptId = name->getUTF8Data();
    auto pathBuf = scriptPath(scriptId);
    if (!pathBuf)
        return;
    dmesg("delete %s from cache", pathBuf);
    remove(pathBuf);
    free(pathBuf);
}

} // namespace vmcache
