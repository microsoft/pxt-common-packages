#include "pxt.h"
#include "nvs_flash.h"

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

    ESP_ERROR_CHECK(nvs_open("PXT", NVS_READWRITE, &handle));
}

namespace settings {

PXT_DEF_STRING(sKeyTooLong, "settings: key too long")
PXT_DEF_STRING(sKeyInvalid, "settings: key invalid")

const char *keyName(String key) {
    const char *p = key->getUTF8Data();
    int n = key->getUTF8Size();
    if (n > 15)
        pxt::throwValue((TValue)sKeyTooLong);
    if (n == 0 || *p == 0x01)
        pxt::throwValue((TValue)sKeyInvalid);
    while (n--) {
        if (*p == 0x00)
            pxt::throwValue((TValue)sKeyInvalid);
        p++;
    }
    return key->getUTF8Data();
}

//%
int _set(String key, Buffer data) {
    settings_init();
    ESP_ERROR_CHECK(nvs_set_blob(handle, keyName(key), data->data, data->length));
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

//%
Buffer _get(String key) {
    settings_init();
    size_t required_size;
    const char *k = keyName(key);
    esp_err_t err = nvs_get_blob(handle, k, NULL, &required_size);
    if (err == ESP_ERR_NVS_NOT_FOUND)
        return NULL;
    ESP_ERROR_CHECK(err);

    auto ret = mkBuffer(NULL, required_size);
    registerGCObj(ret);
    ESP_ERROR_CHECK(nvs_get_blob(handle, k, ret->data, &required_size));
    unregisterGCObj(ret);

    return ret;
}

//%
void _userClean() {
    settings_init();
    nvs_iterator_t it = nvs_entry_find(NVS_DEFAULT_PART_NAME, "PXT", NVS_TYPE_BLOB);
    for (; it; it = nvs_entry_next(it)) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        if (info.key[0] == '#')
            continue;
        ESP_ERROR_CHECK(nvs_erase_key(handle, info.key));
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

    nvs_iterator_t it = nvs_entry_find(NVS_DEFAULT_PART_NAME, "PXT", NVS_TYPE_BLOB);

    for (; it; it = nvs_entry_next(it)) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        if (!wantsInternal && info.key[0] == '#')
            continue;
        if (memcmp(info.key, prefData, prefLen) != 0)
            continue;
        auto str = mkString(info.key, -1);
        registerGCObj(str);
        res->head.push((TValue)str);
        unregisterGCObj(str);
    }
    unregisterGCObj(res);

    return res;
}

} // namespace settings
