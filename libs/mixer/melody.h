#pragma once

#ifndef OUTPUT_BITS
#define OUTPUT_BITS 10
#endif

#define SW_TRIANGLE 1
#define SW_SAWTOOTH 2
#define SW_SINE 3 // TODO remove it? it takes space
#define SW_NOISE 4
#define SW_REAL_NOISE 5
#define SW_SQUARE_10 11
#define SW_SQUARE_50 15

struct SoundInstruction {
    uint8_t soundWave;
    uint8_t flags;
    uint16_t frequency;   // Hz
    uint16_t duration;    // ms
    int16_t startVolume; // 0-1023
    int16_t endVolume;   // 0-1023
};


#ifdef DATASTREAM_MAXIMUM_BUFFERS
#define CODAL 1
#endif

namespace music {

#define MAX_SOUNDS 5

STATIC_ASSERT((1 << (16 - OUTPUT_BITS)) > MAX_SOUNDS);

struct PlayingSound {
    uint32_t startSampleNo;
    uint32_t samplesLeftInCurr;
    uint32_t tonePosition;
    int32_t prevVolume;
    Buffer instructions;
    SoundInstruction *currInstr, *instrEnd;
};

struct WaitingSound {
    uint32_t startSampleNo;
    WaitingSound *next;
    Buffer instructions;
};

class WSynthesizer
#ifdef CODAL
    : public DataSource
#endif
{
  public:
    uint32_t currSample; // after 25h of playing we might get a glitch
    uint32_t sampleRate; // eg 44100
    PlayingSound playingSounds[MAX_SOUNDS];
    WaitingSound *waiting;
    bool active;

    SoundOutput out;

    int fillSamples(int16_t *dst, int numsamples);
    int updateQueues();

    WSynthesizer() : out(*this) {
        currSample = 0;
        active = false;
        sampleRate = out.dac.getSampleRate();
        memset(&playingSounds, 0, sizeof(playingSounds));
        waiting = NULL;
#ifdef CODAL
        upstream = NULL;
#endif
    }
    virtual ~WSynthesizer() {}

    void poke() {
        if (!active) {
            active = true;
#ifdef CODAL
            if (upstream)
                upstream->pullRequest();
#endif
        }
    }

#ifdef CODAL
    DataSink *upstream;
    virtual ManagedBuffer pull() {
        ManagedBuffer data(512);
        int r = fillSamples((int16_t *)data.getBytes(), 512 / 2);
        if (!r) {
            active = false;
            // return empty - nothing left to play
            return ManagedBuffer();
        }
        if (upstream)
            upstream->pullRequest();
        return data;
    }
    virtual void connect(DataSink &sink) { upstream = &sink; }
#endif
};

}
