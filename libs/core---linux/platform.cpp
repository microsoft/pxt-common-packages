#include "pxt.h"

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>

namespace pxt {

static void initRandomSeed() {
    int seed = 0xC0DA1;
    int fd = open("/dev/urandom", O_RDONLY);
    read(fd, &seed, sizeof(seed));
    close(fd);
    seedRandom(seed);
}

void sendSerial(const char *data, int len) {
    /*
    if (!serial) {
        serial = new codal::_mbed::Serial(USBTX, NC);
        serial->baud(9600);
    }
    serial->send((uint8_t*)data, len);
    */
}

extern "C" void drawPanic(int code)
{
    // TODO
}


extern "C" void target_init()
{
    initRandomSeed();
}

void screen_init() {

}

}

