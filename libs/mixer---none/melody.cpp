#include "pxt.h"
#include "melody.h"

namespace music {
//%
void forceOutput(int outp) {}

//%
void playInstructions(Buffer buf) {
    auto instr = (SoundInstruction *)buf->data;
    while (instr->soundWave) {
        sleep_ms(instr->duration);
        instr++;
    }
}

//%
void enableAmp(int enabled) {

}

} // namespace music
