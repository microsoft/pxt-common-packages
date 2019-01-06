#include "pxt.h"
#include "Synthesizer.h"
#include "SoundOutput.h"

#include "melody.h"

namespace music {
class SynthChannel {
  public:
    SynthChannel *next;
    Synthesizer synth;
    MixerChannel *mixch;
    bool used;
    virtual ~SynthChannel() {}

    SynthChannel() : synth(SYNTHESIZER_SAMPLE_RATE, true) {}
};

class WSynthesizer {
  public:
    Mixer mixer;
    SoundOutput out;
    SynthChannel *channels;

    WSynthesizer() : out(mixer) { channels = NULL; }
    virtual ~WSynthesizer() {}
};
SINGLETON(WSynthesizer);

SynthChannel *allocateChannel() {
    auto snd = getWSynthesizer();
    auto ch = snd->channels;
    auto numCh = 0;

    while (ch) {
        if (!ch->used) {
            ch->used = true;
            return ch;
        }
        ch = ch->next;
        numCh++;
    }

    if (numCh >= 3)
        return NULL;

    ch = new SynthChannel();
    ch->synth.setVolume(1024);
    ch->synth.setSampleRate(snd->out.dac.getSampleRate());
    ch->mixch = snd->mixer.addChannel(ch->synth.output);
    ch->used = true;
    ch->next = snd->channels;
    snd->channels = ch;

    return ch;
}

//%
void forceOutput(int outp) {
    auto snd = getWSynthesizer();
    snd->out.setOutput(outp);
}

static uint16_t realNoiseTone(void *arg, int position) {
    (void)arg;
    (void)position;
    // see https://en.wikipedia.org/wiki/Xorshift
    static uint32_t x = 0xf01ba80;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return x & 1023;
}

//%
void playInstructions(Buffer buf) {
    auto ch = allocateChannel();
    auto instr = (SoundInstruction *)buf->data;
    auto wave = 0;
    while (instr->soundWave) {
        if (ch) {
            if (wave != instr->soundWave) {
                wave = instr->soundWave;
                switch (wave) {
                case SW_TRIANGLE:
                    ch->synth.setTone(Synthesizer::TriangleTone);
                    break;
                case SW_SAWTOOTH:
                    ch->synth.setTone(Synthesizer::SawtoothTone);
                    break;
                case SW_NOISE:
                    ch->synth.setTone(Synthesizer::NoiseTone);
                    break;
                case SW_REAL_NOISE:
                    ch->synth.setTone(realNoiseTone);
                    break;
                case SW_SINE:
                    ch->synth.setTone(Synthesizer::SineTone);
                    break;
                default:
                    if (SW_SQUARE_10 <= wave && wave <= SW_SQUARE_50) {
                        ch->synth.setTone(Synthesizer::SquareWaveToneExt,
                                          (void *)(102 * (wave - SW_SQUARE_10 + 1)));
                    } else {
                        // silence
                        ch->synth.setTone(Synthesizer::SquareWaveToneExt, (void *)(0));
                    }
                    break;
                }
            }
            ch->synth.setFrequency(instr->frequency, instr->duration, instr->startVolume,
                                   instr->endVolume);
        } else {
            fiber_sleep(instr->duration);
        }
        instr++;
    }
    if (ch)
        ch->used = false;
}

} // namespace music

namespace jacdac {
__attribute__((weak)) void setJackRouterOutput(int output) {}
} // namespace jacdac