#pragma once

#ifndef OUTPUT_BITS
#define OUTPUT_BITS 10
#endif

#define SW_TRIANGLE 1
#define SW_SAWTOOTH 2
#define SW_SINE 3 // TODO remove it? it takes space
#define SW_NOISE 5
#define SW_SQUARE_10 11
#define SW_SQUARE_50 15

struct SoundInstruction {
    uint8_t soundWave;
    uint8_t flags;
    uint16_t frequency;  // Hz
    uint16_t duration;   // ms
    int16_t startVolume; // 0-1023
    int16_t endVolume;   // 0-1023
    uint16_t endFrequency;  // Hz
};

#ifdef DATASTREAM_MAXIMUM_BUFFERS
#define CODAL 1
#endif

namespace music {

#define MAX_SOUNDS 5

STATIC_ASSERT((1 << (16 - OUTPUT_BITS)) > MAX_SOUNDS);

enum class SoundState : uint8_t {
    Waiting, //
    Playing, //
    Done     //
};

struct WaitingSound {
    uint32_t startSampleNo;
    SoundState state;
    WaitingSound *next;
    Buffer instructions;
};

struct PlayingSound {
    uint32_t startSampleNo;
    uint32_t samplesLeftInCurr;
    uint32_t tonePosition;
    int32_t prevVolume;
    uint32_t prevToneStep;
    int32_t prevToneDelta;
    WaitingSound *sound;
    SoundInstruction *currInstr, *instrEnd;
};

class WSynthesizer
#ifdef CODAL
    : public DataSource
#endif
{
  public:
#ifdef CODAL
    DataSink *upstream;
#else
    void *upstream;
#endif
    uint32_t currSample; // after 25h of playing we might get a glitch
    int32_t sampleRate;  // eg 44100
    PlayingSound playingSounds[MAX_SOUNDS];
    WaitingSound *waiting;
    bool active;

    SoundOutput out;

    int fillSamples(int16_t *dst, int numsamples);
    int updateQueues();

    WSynthesizer();
    virtual ~WSynthesizer() {}

    void pokeUpstream() {
#ifdef CODAL
        if (upstream) {
            upstream->pullRequest();
        }
#endif
    }

    void poke() {
        if (!active) {
            active = true;
            pokeUpstream();
        }
    }

#ifdef CODAL
    virtual ManagedBuffer pull() {
        ManagedBuffer data(512);
        auto dp = (int16_t *)data.getBytes();
        auto sz = 512 / 2;
        int r = fillSamples(dp, sz);
        while (sz--) {
            *dp++ += 1 << (OUTPUT_BITS - 1);
        }
        if (!r) {
            active = false;
            // return empty - nothing left to play
            return ManagedBuffer();
        }
        pokeUpstream();
        return data;
    }
    virtual void connect(DataSink &sink) { upstream = &sink; }
#endif
};

} // namespace music
