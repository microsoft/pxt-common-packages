#include "pxt.h"
#include <dirent.h>
#include <stdio.h>
#include <ctype.h>
#include <dirent.h>
#include <sys/stat.h>

namespace vmcache {

static char *dataPath;

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

DLLEXPORT int pxt_vm_cache_hit(const char *scriptId) {
    auto pathBuf = scriptPath(scriptId);
    if (!pathBuf)
        return 0;
    auto fh = fopen(pathBuf, "rb");
    free(pathBuf);
    dmesg("cache %s for %s", fh ? "hit" : "miss", scriptId);
    if (fh) {
        fclose(fh);
        return 1;
    }
    return 0;
}

static char *extractName(uint8_t *data, int len, int *dstSize = NULL) {
    for (auto sect = (VMImageSection *)data; (uint8_t *)vmNextSection(sect) <= data + len;
         sect = vmNextSection(sect)) {
        if (sect->type != SectionType::MetaName)
            continue;
        int slen = sect->size - sizeof(VMImageSection);
        int p;
        for (p = 0; p < slen; p++)
            if (!sect->data[p])
                break;
        if (slen == p)
            return NULL; // not \0-terminated
        if (dstSize)
            *dstSize = slen - 1;
        return (char *)sect->data;
    }

    return NULL;
}

static char *readEntry(DIR *dp, char **id = NULL, struct stat *st = NULL) {
    if (!dp)
        return NULL;

    for (;;) {
        struct dirent *de = readdir(dp);
        if (!de) {
            closedir(dp);
            return NULL;
        }

        uint8_t dataBlock[1024];

        if (de->d_name[0] == '.')
            continue;

        auto filepath = scriptPath(de->d_name);
        if (!filepath)
            continue;

        auto fp = fopen(filepath, "rb");
        if (fp && st)
            stat(filepath, st);
        free(filepath);
        int sz = 0;
        if (fp != NULL) {
            sz = fread(dataBlock, 1, sizeof(dataBlock), fp);
            fclose(fp);
        }
        if (sz <= 20)
            continue;
        if (id)
            *id = strdup(de->d_name);
        auto otherName = extractName(dataBlock, sz);
        if (otherName)
            return strdup(otherName);
        else
            return strdup(de->d_name);
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
    for (;;) {
        auto otherName = readEntry(dp);
        if (!otherName)
            break;
        auto isSame = strcmp(name, otherName) == 0;
        free(otherName);
        if (isSame)
            return true;
    }
    return false;
}

//%
RefCollection *list() {
    auto res = Array_::mk();
    registerGCPtr((TValue)res);

    auto dp = openCacheDir();
    for (;;) {
        struct stat st;
        char *id;
        auto otherName = readEntry(dp, &id, &st);
        if (!otherName)
            break;
        char buf[1024];
        for (auto p = otherName; *p; p++) {
            if (*p == '\"' || *p < 32)
                *p = '_';
        }
        snprintf(buf, 1023, "{ \"id\": \"%s\", \"time\": %lld, \"name\": \"%s\" }", id,
                 (long long)st.st_mtime, otherName);
        free(id);
        free(otherName);
        auto str = mkString(buf, -1);
        Array_::push(res, (TValue)str);
    }

    unregisterGCPtr((TValue)res);
    return res;
}

static void renameImage(uint8_t *data, int len) {
    int sz;
    auto name = extractName(data, len, &sz);
    dmesg("rename image from '%s'", name);
    if (nameExists(name)) {
        int namelen = strlen(name);
        if (namelen + 6 < sz) {
            for (int i = 2; i <= 99; ++i) {
                snprintf(name + namelen, 6, " (%d)", i);
                if (!nameExists(name))
                    break;
            }
        }
        dmesg("renamed to '%s'", name);
    } else {
        dmesg("rename not needed");
    }
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
    renameImage(data, len);
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
    if (!pxt_vm_cache_hit(scriptId))
        return -1;
    auto pathBuf = scriptPath(scriptId);
    dmesg("starting %s from cache", pathBuf);
    pxt_vm_start(pathBuf);
    return 0;
}

//%
void run(String name) {
    auto scriptId = name->getUTF8Data();
    if (!pxt_vm_cache_hit(scriptId))
        return;
    auto pathBuf = scriptPath(scriptId);
    dmesg("starting %s from cache from VM code", pathBuf);
    vmStartFromUser(pathBuf);
}

} // namespace pxt
