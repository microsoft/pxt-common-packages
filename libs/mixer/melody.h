#pragma once

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
