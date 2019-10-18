#include "pxt.h"
#include "SoundOutput.h"
#include "melody.h"

//#define LOG DMESG
#define LOG NOLOG

namespace music {

SINGLETON(WSynthesizer);

static const int16_t sinQ[256] = {
    0,     201,   403,   605,   807,   1009,  1210,  1412,  1614,  1815,  2017,  2218,  2419,
    2621,  2822,  3023,  3224,  3425,  3625,  3826,  4026,  4226,  4426,  4626,  4826,  5026,
    5225,  5424,  5623,  5822,  6020,  6219,  6417,  6615,  6812,  7009,  7206,  7403,  7600,
    7796,  7992,  8187,  8383,  8578,  8772,  8967,  9161,  9354,  9547,  9740,  9933,  10125,
    10317, 10508, 10699, 10890, 11080, 11270, 11459, 11648, 11836, 12024, 12212, 12399, 12585,
    12772, 12957, 13142, 13327, 13511, 13695, 13878, 14060, 14243, 14424, 14605, 14785, 14965,
    15145, 15323, 15501, 15679, 15856, 16032, 16208, 16383, 16557, 16731, 16905, 17077, 17249,
    17420, 17591, 17761, 17930, 18099, 18267, 18434, 18600, 18766, 18931, 19096, 19259, 19422,
    19585, 19746, 19907, 20067, 20226, 20384, 20542, 20699, 20855, 21010, 21165, 21318, 21471,
    21623, 21774, 21925, 22074, 22223, 22371, 22518, 22664, 22810, 22954, 23098, 23241, 23382,
    23523, 23663, 23803, 23941, 24078, 24215, 24350, 24485, 24618, 24751, 24883, 25014, 25144,
    25273, 25401, 25528, 25654, 25779, 25903, 26026, 26148, 26269, 26389, 26509, 26627, 26744,
    26860, 26975, 27089, 27202, 27314, 27425, 27535, 27644, 27752, 27859, 27964, 28069, 28173,
    28275, 28377, 28477, 28576, 28674, 28772, 28868, 28963, 29056, 29149, 29241, 29331, 29421,
    29509, 29596, 29682, 29767, 29851, 29934, 30015, 30096, 30175, 30253, 30330, 30406, 30480,
    30554, 30626, 30697, 30767, 30836, 30904, 30970, 31036, 31100, 31163, 31225, 31285, 31345,
    31403, 31460, 31516, 31570, 31624, 31676, 31727, 31777, 31825, 31873, 31919, 31964, 32008,
    32050, 32092, 32132, 32171, 32209, 32245, 32280, 32314, 32347, 32379, 32409, 32438, 32466,
    32493, 32518, 32542, 32565, 32587, 32607, 32627, 32645, 32661, 32677, 32691, 32704, 32716,
    32727, 32736, 32744, 32751, 32757, 32761, 32764, 32766, 32767};

typedef int (*gentone_t)(uintptr_t userData, uint32_t position);

static int noiseTone(uintptr_t userData, uint32_t position) {
    (void)userData;
    (void)position;
    // see https://en.wikipedia.org/wiki/Xorshift
    static uint32_t x = 0xf01ba80;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x & 0xffff) - 0x7fff;
}

static int sineTone(uintptr_t userData, uint32_t position) {
    (void)userData;
    int p = position >= 512 ? position - 512 : position;
    int r;
    if (p < 256) {
        r = sinQ[p];
    } else {
        r = sinQ[511 - p];
    }
    return position >= 512 ? -r : r;
}

static int sawtoothTone(uintptr_t userData, uint32_t position) {
    (void)userData;
    return (position << 6) - 0x7fff;
}

static int triangleTone(uintptr_t userData, uint32_t position) {
    (void)userData;
    return position < 512 ? (position << 7) - 0x7fff : ((1023 - position) << 7) - 0x7fff;
}

static int squareWaveTone(uintptr_t wave, uint32_t position) {
    return position < (102 * (wave - SW_SQUARE_10 + 1)) ? -0x7fff : 0x7fff;
}

static int silenceTone(uintptr_t userData, uint32_t position) {
    (void)userData;
    (void)position;
    return 0;
}

static gentone_t getWaveFn(uint8_t wave) {
    switch (wave) {
    case SW_TRIANGLE:
        return triangleTone;
    case SW_SAWTOOTH:
        return sawtoothTone;
    case SW_NOISE:
        return noiseTone;
    case SW_SINE:
        return sineTone;
    default:
        if (SW_SQUARE_10 <= wave && wave <= SW_SQUARE_50)
            return squareWaveTone;
        else
            return silenceTone;
    }
}

#define CLAMP(lo, v, hi) ((v) = ((v) < (lo) ? (lo) : (v) > (hi) ? (hi) : (v)))

int WSynthesizer::updateQueues() {
    const int maxTime = 0xffffff;
    while (1) {
        WaitingSound *p;
        int minLeft = maxTime;
        for (p = waiting; p; p = p->next) {
            int timeLeft =
                p->state == SoundState::Waiting ? p->startSampleNo - currSample : maxTime;
            if (timeLeft <= 0) {
                break;
            }
            if (timeLeft < minLeft)
                minLeft = timeLeft;
        }
        if (p) {
            PlayingSound *snd;
            int minIdx = -1;
            for (unsigned i = 0; i < MAX_SOUNDS; ++i) {
                snd = &playingSounds[i];
                if (snd->sound == NULL)
                    break;
                if (minIdx == -1 ||
                    playingSounds[minIdx].startSampleNo < playingSounds[i].startSampleNo)
                    minIdx = i;
                snd = NULL;
            }
            // if we didn't find a free slot, expel the oldest sound
            if (!snd)
                snd = &playingSounds[minIdx];
            if (snd->sound)
                snd->sound->state = SoundState::Done;
            snd->sound = p;
            p->state = SoundState::Playing;
            snd->startSampleNo = currSample;
            snd->currInstr = (SoundInstruction *)p->instructions->data;
            snd->instrEnd = snd->currInstr + p->instructions->length / sizeof(SoundInstruction);
            for (auto p = snd->currInstr; p < snd->instrEnd; p++) {
                CLAMP(20, p->frequency, 20000);
                CLAMP(20, p->endFrequency, 20000);
                CLAMP(0, p->startVolume, 1023);
                CLAMP(0, p->endVolume, 1023);
                CLAMP(1, p->duration, 60000);
            }
            snd->prevVolume = -1;
        } else {
            // no more sounds to move
            return minLeft;
        }
    }
}

int WSynthesizer::fillSamples(int16_t *dst, int numsamples) {
    if (numsamples <= 0)
        return 1;

    int timeLeft = updateQueues();
    int res = waiting != NULL;

    // if there's a pending sound to be started somewhere during numsamples,
    // split the call into two
    if (timeLeft < numsamples) {
        fillSamples(dst, timeLeft);
        LOG("M split %d", timeLeft);
        fillSamples(dst + timeLeft, numsamples - timeLeft);
        return 1;
    }

    memset(dst, 0, numsamples * 2);

    uint32_t samplesPerMS = (sampleRate << 8) / 1000;
    float toneStepMult = (1024.0 * (1 << 16)) / sampleRate;
    const int MAXVAL = (1 << (OUTPUT_BITS - 1)) - 1;

    for (unsigned i = 0; i < MAX_SOUNDS; ++i) {
        PlayingSound *snd = &playingSounds[i];
        if (snd->sound == NULL)
            continue;

        res = 1;

        SoundInstruction *instr = NULL;
        gentone_t fn = NULL;
        snd->currInstr--;
        uint32_t toneStep = 0;
        int32_t toneDelta = 0;
        int32_t volumeStep = 0;
        uint32_t tonePosition = snd->tonePosition;
        uint32_t samplesLeft = 0;
        uint8_t wave = 0;
        int32_t volume = 0;
        uint32_t prevFreq = 0;
        uint32_t prevEndFreq = 0;

        for (int j = 0; j < numsamples; ++j) {
            if (samplesLeft == 0) {
                instr = ++snd->currInstr;
                if (instr >= snd->instrEnd) {
                    break;
                }
                wave = instr->soundWave;
                fn = getWaveFn(wave);

                samplesLeft = (uint32_t)(instr->duration * samplesPerMS >> 8);
                volumeStep = ((int)(instr->endVolume - instr->startVolume) << 16) / samplesLeft;

                if (j == 0 && snd->prevVolume != -1) {
                    // restore previous state
                    samplesLeft = snd->samplesLeftInCurr;
                    volume = snd->prevVolume;
                    toneStep = snd->prevToneStep;
                    toneDelta = snd->prevToneDelta;
                    prevFreq = instr->frequency;
                    prevEndFreq = instr->endFrequency;
                } else {
                    LOG("#sampl %d %p", samplesLeft, instr);
                    volume = instr->startVolume << 16;
                    if (prevFreq != instr->frequency || prevEndFreq != instr->endFrequency) {
                        toneStep = (uint32_t)(toneStepMult * instr->frequency);
                        if (instr->frequency != instr->endFrequency) {
                            uint32_t endToneStep = (uint32_t)(toneStepMult * instr->endFrequency);
                            toneDelta = (int32_t)(endToneStep - toneStep) / (int32_t)samplesLeft;
                        } else {
                            toneDelta = 0;
                        }
                        prevFreq = instr->frequency;
                        prevEndFreq = instr->endFrequency;
                    }
                }
            }

            int v = fn(wave, (tonePosition >> 16) & 1023);
            v = (v * (volume >> 16)) >> (10 + (16 - OUTPUT_BITS));

            // if (v > MAXVAL)
            //    target_panic(123);

            dst[j] += v;

            tonePosition += toneStep;
            toneStep += toneDelta;
            volume += volumeStep;
            samplesLeft--;
        }

        if (instr >= snd->instrEnd) {
            snd->sound->state = SoundState::Done;
            snd->sound = NULL;
        } else {
            snd->tonePosition = tonePosition;
            if (samplesLeft == 0)
                samplesLeft++; // avoid infinite loop in next iteration
            snd->samplesLeftInCurr = samplesLeft;
            snd->prevVolume = volume;
            snd->prevToneDelta = toneDelta;
            snd->prevToneStep = toneStep;
        }
    }

    currSample += numsamples;

    for (int j = 0; j < numsamples; ++j) {
        if (dst[j] > MAXVAL)
            dst[j] = MAXVAL;
        else if (dst[j] < -MAXVAL)
            dst[j] = -MAXVAL;
    }

    return res;
}

//%
void enableAmp(int enabled) {
    // this is also compiled on linux
#ifdef LOOKUP_PIN
    auto pin = LOOKUP_PIN(SPEAKER_AMP);
    if (pin) {
        if (PIN(SPEAKER_AMP) & CFG_PIN_CONFIG_ACTIVE_LO)
            enabled = !enabled;
        pin->setDigitalValue(enabled);
    }
#endif
}

//%
void forceOutput(int outp) {
    auto snd = getWSynthesizer();
    snd->out.setOutput(outp);
}

//%
void queuePlayInstructions(int when, Buffer buf) {
    auto snd = getWSynthesizer();

    registerGCObj(buf);

    auto p = new WaitingSound;
    p->state = SoundState::Waiting;
    p->instructions = buf;
    p->startSampleNo = snd->currSample + when * snd->sampleRate / 1000;

    LOG("Queue %dms now=%d off=%d %p", when, snd->currSample, p->startSampleNo - snd->currSample,
        buf->data);

    target_disable_irq();
    // add new sound to queue
    p->next = snd->waiting;
    snd->waiting = p;
    // remove sounds that have already been fully played
    while (p) {
        while (p->next && p->next->state == SoundState::Done) {
            auto todel = p->next;
            p->next = todel->next;
            unregisterGCObj(todel->instructions);
            delete todel;
        }
        p = p->next;
    }
    target_enable_irq();

    snd->poke();
}

//%
void stopPlaying() {
    LOG("stop playing!");

    auto snd = getWSynthesizer();

    target_disable_irq();
    auto p = snd->waiting;
    snd->waiting = NULL;
    for (unsigned i = 0; i < MAX_SOUNDS; ++i) {
        snd->playingSounds[i].sound = NULL;
    }
    while (p) {
        auto n = p->next;
        unregisterGCObj(p->instructions);
        delete p;
        p = n;
    }
    target_enable_irq();
}

WSynthesizer::WSynthesizer() : upstream(NULL), out(*this) {
    currSample = 0;
    active = false;
    sampleRate = out.dac.getSampleRate();
    memset(&playingSounds, 0, sizeof(playingSounds));
    waiting = NULL;
    PXT_REGISTER_RESET(stopPlaying);
}

} // namespace music

namespace jacdac {
__attribute__((weak)) void setJackRouterOutput(int output) {}
} // namespace jacdac