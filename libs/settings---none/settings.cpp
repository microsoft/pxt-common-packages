#include "pxt.h"

namespace settings {

//%
int _set(String key, Buffer data) {
    return 0;
}

//%
int _remove(String key) {
    return 0;
}

//%
bool _exists(String key) {
    return false;
}

//%
Buffer _get(String key) {
    return NULL;
}

//%
void _userClean() {}

//%
RefCollection *_list(String prefix) {
    auto res = Array_::mk();
    return res;
}

} // namespace settings
