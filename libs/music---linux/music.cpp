#include "pxt.h"

#include <sys/types.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/soundcard.h>
#include <pthread.h>

#define NOTE_PAUSE 20

namespace music {

#define BUFLEN 2000
static uint16_t soundBuf[BUFLEN];
static volatile int freq;
static int playerRunning;
// static volatile int timeout;

static void *musicPlayer(void *) {
    int audio_fd = open("/dev/dsp", O_WRONLY);

    int format = AFMT_U16_LE;
    ioctl(audio_fd, SNDCTL_DSP_SETFMT, &format);

    int stereo = 0; // mono
    ioctl(audio_fd, SNDCTL_DSP_STEREO, &stereo);

    int speed = 44100;
    ioctl(audio_fd, SNDCTL_DSP_SPEED, &speed);

    for (;;) {
        int numsamples = BUFLEN / 2;
        if (freq == 0) {
            memset(soundBuf, 0, numsamples * 2);
        } else {
            float period = (float)speed / freq;
            if (period < 2)
                period = 2;
            int numperiods = BUFLEN / period;
            numsamples = numperiods * period;
            float step = 2 * M_PI / period;
            float ang = 0;
            for (int i = 0; i < numsamples; ++i) {
                soundBuf[i] = 0x7fff * (1 + sinf(ang));
                ang += step;
            }
        }
#if 0
        if (timeout) {
            timeout -= 1000 * numsamples / speed;
            if (timeout < 0) {
                timeout = 0;
                freq = 0;
            }
        }
#endif
        write(audio_fd, soundBuf, numsamples * 2);
        for (;;) {
            int delay;
            ioctl(audio_fd, SNDCTL_DSP_GETODELAY, &delay);
            if (delay < (numsamples * 2) / 2)
                break;
            sleep_core_us(3000);
        }
    }

    return NULL;
}

/**
 * Play a tone through the speaker for some amount of time.
 * @param frequency pitch of the tone to play in Hertz (Hz), eg: Note.C
 * @param ms tone duration in milliseconds (ms), eg: BeatFraction.Half
 */
//% help=music/play-tone
//% blockId=music_play_note block="play tone|at %note=device_note|for %duration=device_beat"
//% parts="headphone" async
//% blockNamespace=music
//% weight=76 blockGap=8
void playTone(int frequency, int ms) {
    if (!playerRunning) {
        playerRunning = true;
        pthread_t upd;
        pthread_create(&upd, NULL, musicPlayer, NULL);
        pthread_detach(upd);
    }

    if (frequency <= 0) {
        freq = 0;
    } else {
        freq = frequency;
        if (ms > 0) {
            int d = max(1, ms - NOTE_PAUSE); // allow for short rest
            int r = max(1, ms - d);
            sleep_ms(d);
            freq = 0;
            sleep_ms(r);
        }
    }
}

} // namespace music
