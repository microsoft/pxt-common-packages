#include "pxt.h"
#include "Synthesizer.h"
#include "SoundOutput.h"

#define SW_TRIANGLE 1
#define SW_SAWTOOTH 2
#define SW_SINE 3 // TODO remove it? it takes space
#define SW_NOISE 4
#define SW_SQUARE_10 11
#define SW_SQUARE_50 15

struct SoundInstruction {
    uint8_t soundWave;
    uint8_t flags;
    uint16_t frequency;
    uint16_t duration;
    uint16_t startVolume;
    uint16_t endVolume;
};

namespace music {
class SynthChannel {
  public:
    SynthChannel *next;
    Synthesizer synth;
    MixerChannel *mixch;
    bool used;

    SynthChannel() : synth(SYNTHESIZER_SAMPLE_RATE, true) {}
};

class WSynthesizer {
  public:
    Mixer mixer;
    SoundOutput out;
    SynthChannel *channels;

    WSynthesizer() : out(mixer) { channels = NULL; }
};
SINGLETON(WSynthesizer);

SynthChannel *allocateChannel() {
    auto snd = getWSynthesizer();
    auto ch = snd->channels;
    auto numCh = 0;

    while (ch) {
        if (!ch->used)
            return ch;
        ch = ch->next;
        numCh++;
    }

    if (numCh > 5)
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
