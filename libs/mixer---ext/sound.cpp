#include "pxt.h"
#include "SoundOutput.h"
#include "melody.h"

namespace music {

static ExtDAC *dac;

DLLEXPORT void pxt_get_audio_samples(int16_t *buf, unsigned numSamples) {
    if (!dac) {
        memset(buf, 0, numSamples * 2);
        return;
    }

    target_disable_irq();
    dac->src.fillSamples(buf, numSamples);
    target_enable_irq();

    for (unsigned i = 0; i < numSamples; ++i) {
        // playing at half-volume
        buf[i] = buf[i] << 3;
    }

    //DMESG("samples %d %d %d %d", numSamples, buf[0], buf[20], buf[100]);
}

ExtDAC::ExtDAC(WSynthesizer &data) : src(data) {
    dac = this;
}

} // namespace music