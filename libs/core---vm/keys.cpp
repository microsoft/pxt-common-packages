#include "pxt.h"

namespace pxt {
void initKeys() {}

//% expose
int pressureLevelByButtonId(int btnId, int codalId) {
    return 0; // TODO
}

//% expose
void setupButton(int buttonId, int key) {
    (void)buttonId;
    (void)key;
    // not needed on RPi
}

} // namespace pxt