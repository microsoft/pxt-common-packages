#include "pxt.h"
#include "KeyValueStorage.h"

namespace pxt {

class WKeyValueStorage {
#ifdef CODAL_NVMCONTROLLER
    CODAL_NVMCONTROLLER controller;
#else
    NVMController controller;
#endif
    KeyValueStorage storage;
  public:

    WKeyValueStorage()
    : controller()
    , storage(controller) {
    }

    bool isSupported() {
#ifdef CODAL_NVMCONTROLLER
      return true;
#else
      return false;
#endif
    }

    int put(String key, Buffer data) {
#ifdef CODAL_NVMCONTROLLER
        ManagedString mkey(key->getUTF8Data(), key->getUTF8Size());
        return storage.put(mkey, data->data, data->length);
#else
        return -1;
#endif
    }

    Buffer get(String key) {
#ifdef CODAL_NVMCONTROLLER
        Buffer buf = NULL;
        ManagedString mkey(key->getUTF8Data(), key->getUTF8Size());
        auto entry = storage.get(mkey);
        if (entry) {
          buf = mkBuffer(entry->value, sizeof(entry->value));
          free(entry);
        }
        return buf;
#else
        return NULL;
#endif
    }

    void remove(String key) {
#ifdef CODAL_NVMCONTROLLER
        ManagedString mkey(key->getUTF8Data(), key->getUTF8Size());
        storage.remove(mkey);
#endif
    }

    void clear() {
#ifdef CODAL_NVMCONTROLLER
        storage.wipe();
#endif
    }
};
SINGLETON(WKeyValueStorage);

}

namespace configStorage {
  /**
  * Puts an entry in the device storage. Key may have up to 16 characters (bytes).
  * @param key the identifier (max 16 characters)
  * @param value the data (max 32 characters)
  */
  //%
  void setBuffer(String key, Buffer value) {
    auto kvm = pxt::getWKeyValueStorage();
    kvm->put(key, value);
  }

  /**
  * Gets an entry from the device storage. Key may have up to 16 characters (bytes).
  * @param key the identifier (max 16 characters)
  */
  //%
  Buffer getBuffer(String key) {
    auto kvm = pxt::getWKeyValueStorage();
    return kvm->get(key);
  }

  /**
  * Removes the key from local storage
  * @param key the identifier (max 16 characters)
  */
  //%
  void removeItem(String key) {
    auto kvm = pxt::getWKeyValueStorage();
    kvm->remove(key);
  }

  /**
  * Clears the local storage
  */
  //%
  void clear() {
    auto kvm = pxt::getWKeyValueStorage();
    kvm->clear();
  }
}
