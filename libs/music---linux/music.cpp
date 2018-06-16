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
static int numBuffers = 0;
// static volatile int timeout;

void writeAll(int fd, void *dst, uint32_t length) {
    while (length) {
        int curr = write(fd, dst, length);
        if (curr < 0) return;
        length -= curr;
        dst = (char *)dst + curr;
    }
}

static void *musicPlayer(void *) {
    int audio_fd = open("/dev/dsp", O_WRONLY);

    int format = AFMT_U16_LE;
    ioctl(audio_fd, SNDCTL_DSP_SETFMT, &format);

    int stereo = 0; // mono
    ioctl(audio_fd, SNDCTL_DSP_STEREO, &stereo);

    int speed = 44100;
    ioctl(audio_fd, SNDCTL_DSP_SPEED, &speed);

    //int frag = (150 << 16) | (  5);
    //ioctl(audio_fd, SNDCTL_DSP_SETFRAGMENT, &frag);

    for (;;) {
        int numsamples = BUFLEN - 10;
        if (freq == 0) {
            memset(soundBuf, 0, numsamples * 2);
        } else {
            numBuffers++;
            double period = (double)speed / freq;
            if (period < 2)
                period = 2;
            int numperiods = BUFLEN / period;
            numsamples = numperiods * period;
            double step = 2 * M_PI / period;
            double ang = 0;
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
        writeAll(audio_fd, soundBuf, numsamples * 2);
        for (;;) {
            int delay;
            ioctl(audio_fd, SNDCTL_DSP_GETODELAY, &delay);
            if (delay < (numsamples * 2) / 2)
                break;
            sleep_core_us(1000);
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
