#include "pxt.h"
#include <dirent.h>
#include <stdio.h>
#include <ctype.h>
#include <sys/stat.h>

static char *dataPath;

static char *scriptPath(const char *scriptId) {
    for (auto p = scriptId; *p; ++p)
        if (!isalnum(*p) && *p != '-' && *p != '_')
            return NULL;
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
}

DLLEXPORT int pxt_vm_cache_hit(const char *scriptId) {
    auto pathBuf = scriptPath(scriptId);
    if (!pathBuf)
        return 0;
    auto fh = fopen(pathBuf, "rb");
    free(pathBuf);
    if (fh) {
        fclose(fh);
        return 1;
    }
    return 0;
}

DLLEXPORT int pxt_vm_save_in_cache(const char *scriptId, const uint8_t *data, int len) {
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
    auto fh = fopen(pathBuf, "wb");
    free(pathBuf);
    if (!fh)
        return -2;
    fwrite(data, len, 1, fh);
    fclose(fh);
    return 0;
}

DLLEXPORT void pxt_vm_start(const char *fn);

DLLEXPORT int pxt_vm_cache_start(const char *scriptId) {
    if (!pxt_vm_cache_hit(scriptId))
        return -1;
    auto pathBuf = scriptPath(scriptId);
    pxt_vm_start(pathBuf);
    return 0;
}
