#include "pxt.h"
#include "nvs_flash.h"
#include "mbedtls/sha256.h"

#define STORE_NAME "PXT2"

#define FAIL(msg)                                                                                  \
    do {                                                                                           \
        DMESG("FAILURE: %s", msg);                                                                 \
        abort();                                                                                   \
    } while (0)

static nvs_handle_t handle;

void settings_init(void) {
    if (handle)
        return;

    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(nvs_open(STORE_NAME, NVS_READWRITE, &handle));
}

namespace settings {

PXT_DEF_STRING(sKeyTooLong, "settings: key too long")

const char *keyName(String key) {
    static char keybuf[16];

    mbedtls_sha256_context sha256_ctx;
    uint8_t output[32];

    mbedtls_sha256_init(&sha256_ctx);
    mbedtls_sha256_starts_ret(&sha256_ctx, false);
    mbedtls_sha256_update_ret(&sha256_ctx, (unsigned char *)key->getUTF8Data(), key->getUTF8Size());
    mbedtls_sha256_finish_ret(&sha256_ctx, output);

    for (int i = 0; i < sizeof(keybuf) - 1; ++i)
        keybuf[i] = output[i] == 0 ? 0x01 : output[i];
    keybuf[sizeof(keybuf) - 1] = 0;

    return keybuf;
}

//%
int _set(String key, Buffer data) {
    settings_init();
    int n = key->getUTF8Size();
    if (n > 200)
        pxt::throwValue((TValue)sKeyTooLong);
    int bufsize = 1 + n + data->length;
    uint8_t *buf = (uint8_t *)malloc(bufsize);
    buf[0] = n;
    memcpy(buf + 1, key->getUTF8Data(), n);
    memcpy(buf + 1 + n, data->data, data->length);
    ESP_ERROR_CHECK(nvs_set_blob(handle, keyName(key), buf, bufsize));
    free(buf);
    ESP_ERROR_CHECK(nvs_commit(handle));
    return 0;
}

//%
int _remove(String key) {
    settings_init();
    if (nvs_erase_key(handle, keyName(key)) == ESP_OK) {
        ESP_ERROR_CHECK(nvs_commit(handle));
        return 0;
    }
    return -1;
}

//%
bool _exists(String key) {
    settings_init();
    size_t required_size;
    esp_err_t err = nvs_get_blob(handle, keyName(key), NULL, &required_size);
    if (err == ESP_ERR_NVS_NOT_FOUND)
        return 0;
    ESP_ERROR_CHECK(err);
    return 1;
}

static uint8_t *getEntry(const char *k, int *size = NULL) {
    size_t required_size;
    esp_err_t err = nvs_get_blob(handle, k, NULL, &required_size);
    if (err == ESP_ERR_NVS_NOT_FOUND)
        return NULL;
    ESP_ERROR_CHECK(err);

    uint8_t *tmp = (uint8_t *)malloc(required_size);
    ESP_ERROR_CHECK(nvs_get_blob(handle, k, tmp, &required_size));

    if (size)
        *size = required_size;
    return tmp;
}

//%
Buffer _get(String key) {
    settings_init();
    const char *k = keyName(key);
    int required_size;

    uint8_t *tmp = getEntry(k, &required_size);
    if (!tmp)
        return NULL;

    int bufsz = required_size - 1 - tmp[0];
    if (bufsz < 0)
        abort();
    auto ret = mkBuffer(tmp + 1 + tmp[0], bufsz);
    free(tmp);
    return ret;
}

//%
void _userClean() {
    settings_init();
    nvs_iterator_t it = nvs_entry_find(NVS_DEFAULT_PART_NAME, STORE_NAME, NVS_TYPE_BLOB);
    for (; it; it = nvs_entry_next(it)) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        uint8_t *tmp = getEntry(info.key);
        if (tmp[1] != '#')
            ESP_ERROR_CHECK(nvs_erase_key(handle, info.key));
        free(tmp);
    }
    ESP_ERROR_CHECK(nvs_commit(handle));
}

//%
RefCollection *_list(String prefix) {
    settings_init();
    auto res = Array_::mk();
    registerGCObj(res);

    auto prefData = prefix->getUTF8Data();
    auto prefLen = prefix->getUTF8Size();
    auto wantsInternal = prefData[0] == '#';

    nvs_iterator_t it = nvs_entry_find(NVS_DEFAULT_PART_NAME, STORE_NAME, NVS_TYPE_BLOB);

    for (; it; it = nvs_entry_next(it)) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        uint8_t *tmp = getEntry(info.key);
        if (!wantsInternal && tmp[1] == '#')
            continue;
        if (tmp[0] < prefLen || memcmp(tmp + 1, prefData, prefLen) != 0)
            continue;
        auto str = mkString((char *)(tmp + 1), tmp[0]);
        registerGCObj(str);
        res->head.push((TValue)str);
        unregisterGCObj(str);
        free(tmp);
    }
    unregisterGCObj(res);

    return res;
}

} // namespace settings
