#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

namespace pxt {

struct EnvConfig {
    const char *name;
    const char *value;
    EnvConfig *next;
};

static EnvConfig *readEnvConfig(const char *name) {
    FILE *f = fopen(name, "r");
    DMESG("read config: %s %s", name, !f ? "missing!" : "");
    if (!f)
        return NULL;
    EnvConfig *res = NULL;
    EnvConfig *endres = NULL;
    for (;;) {
        char *line = NULL;
        size_t len = 0;
        int llen = getline(&line, &len, f);
        if (llen <= 0)
            break;
        char *p = line;
        while (isspace(*p))
            p++;
        if (!*p || *p == '#') {
            free(line);
            continue;
        }

        auto name = p;
        while (isalnum(*p) || strchr("-_.", *p))
            p++;
        auto endName = p;
        while (isspace(*p))
            p++;
        if (*p == '=' || *p == ':') {
            p++;
        } else {
            free(line);
            continue;
        }
        *endName = 0;
        while (isspace(*p))
            p++;

        auto e = new EnvConfig;
        e->name = name;
        e->value = p;
        e->next = endres;

        if (*p) {
            auto ep = p + strlen(p) - 1;
            while (ep > p && isspace(*ep))
                ep--;
            ep++;
            *ep = 0;
        }

        DMESG("%s=%s", e->name, e->value);

        if (endres == NULL) {
            res = e;
        } else {
            endres->next = e;
        }
        e->next = NULL;
        endres = e;
    }
    fclose(f);

    return res;
}

static int gotConfig;
static EnvConfig *envConfig;
static void readConfig() {
    if (gotConfig)
        return;
    gotConfig = 1;
    envConfig = readEnvConfig("/sd/arcade.cfg");
    DMESG("config done");
}
const char *getConfigString(const char *name) {
    readConfig();
    for (auto p = envConfig; p; p = p->next) {
        if (strcmp(p->name, name) == 0)
            return p->value;
    }
    return NULL;
}
int getConfigInt(const char *name, int defl) {
    auto v = getConfigString(name);
    if (!v)
        return defl;
    sscanf(v, "%d", &defl);
    return defl;
}

const int *getConfigInts(const char *name) {
    static int buf[30];

    buf[0] = ENDMARK;

    auto v = getConfigString(name);

    if (!v)
        return buf;

    int bp = 0;

    while (bp < 25) {
        while (isspace(*v))
            v++;
        if (!*v)
            break;
        if (sscanf(v, "%i", &buf[bp]) != 1)
            break;
        while (*v && !isspace(*v) && *v != ',')
            v++;
        while (isspace(*v))
            v++;
        if (*v == ',')
            v++;
        bp++;
    }
    buf[bp] = ENDMARK;

    // if (gotConfig++ < 20)
    //    DMESG("%s - %d %d %d len=%d", name, buf[0], buf[1], buf[2], bp);

    return buf;
}

} // namespace pxt