#include "pxt.h"
#include "serial-common.h"

#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdint.h>
#include <sys/signal.h>
#include <sys/types.h>
#include <termios.h>
#include <errno.h>

#ifndef SERIAL_DEVICE
#define SERIAL_DEVICE "/dev/ttyS0"
#endif

namespace serial {
/**
 * Opens a Serial communication driver
 */
//%
SerialDevice internalCreateSerialDevice(int id) {
    return new LinuxSerialDevice(id);
}

struct SerialSpeed {
    int code;
    int speed;
};

static const SerialSpeed serialSpeeds[] = {
    {B50, 50},           {B75, 75},           {B110, 110},         {B134, 134},
    {B150, 150},         {B200, 200},         {B300, 300},         {B600, 600},
    {B1200, 1200},       {B1800, 1800},       {B2400, 2400},       {B4800, 4800},
    {B9600, 9600},       {B19200, 19200},     {B38400, 38400},     {B57600, 57600},
    {B115200, 115200},   {B230400, 230400},   {B460800, 460800},   {B500000, 500000},
    {B576000, 576000},   {B921600, 921600},   {B1000000, 1000000}, {B1152000, 1152000},
    {B1500000, 1500000}, {B2000000, 2000000}, {B2500000, 2500000}, {B3000000, 3000000},
    {B3500000, 3500000}, {B4000000, 4000000}};

void LinuxSerialDevice::init() {
    auto serialDev = getConfigString("SERIAL_DEVICE");
    if (!serialDev) {
        char buf[40];
        int fd = open("/proc/device-tree/model", O_RDONLY);
        if (fd >= 0) {
            int len = ::read(fd, buf, sizeof(buf) - 1);
            DMESG("device model: %s", buf);
            if (len > 0) {
                buf[len] = 0;
                if (strstr(buf, "Raspberry Pi")) {
                    if (strstr(buf, "Raspberry Pi 3 Model") || strstr(buf, "Raspberry Pi Zero W"))
                        serialDev = "/dev/ttyS0";
                    else
                        serialDev = "/dev/ttyAMA0";
                }
            }
            close(fd);
        }
    }

    if (!serialDev)
        serialDev = SERIAL_DEVICE;

    DMESG("serial device: %s", serialDev);

    fd = open(serialDev, O_RDWR | O_NOCTTY);
    if (fd < 0)
        target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);

    setRxBufferSize(128);
    setBaudRate(115200);

    pthread_t pid;
    pthread_create(&pid, NULL, &LinuxSerialDevice::readLoop, this);
    pthread_detach(pid);
}

void *LinuxSerialDevice::readLoop(void *th) {
    ((LinuxSerialDevice *)th)->readLoopInner();
    return NULL;
}

void LinuxSerialDevice::readLoopInner() {
    uint8_t buf[128];
    while (true) {
        pthread_mutex_lock(&lock);
        int left = buffersz - bufferedSize();
        pthread_mutex_unlock(&lock);
        if (left == 0) {
            raiseEvent(id, CODAL_SERIAL_EVT_RX_FULL);
            sleep_core_us(20 * 1000);
            continue;
        }
        if (left > (int)sizeof(buf))
            left = sizeof(buf);
        int r = ::read(fd, buf, left);
        if (r <= 0)
            target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);

        pthread_mutex_lock(&lock);
        int chunk = buffersz - writep;
        if (r < chunk)
            chunk = r;
        memcpy(buffer + writep, buf, chunk);
        writep += chunk;
        if (writep == buffersz) {
            writep = 0;
            int r2 = r - chunk;
            if (r2) {
                memcpy(buffer, buf + chunk, r2);
                writep += r2;
            }
        }
        pthread_mutex_unlock(&lock);

        raiseEvent(id, CODAL_SERIAL_EVT_DATA_RECEIVED);

        if (delim != -1)
            for (int i = 0; i < r; ++i)
                if (buf[i] == delim)
                    raiseEvent(id, CODAL_SERIAL_EVT_DELIM_MATCH);
    }
}

void LinuxSerialDevice::setBaudRate(int rate) {
    struct termios tio;
    memset(&tio, 0, sizeof(tio));
    if (tcgetattr(fd, &tio) != 0) {
        target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);
        return;
    }

    int speedCode = B115200;
    for (int i = sizeof(serialSpeeds) / sizeof(serialSpeeds[0]); i >= 0; i--) {
        if (serialSpeeds[i].speed <= rate) {
            speedCode = serialSpeeds[i].code;
            DMESG("set serial speed: %d->%d", rate, serialSpeeds[i].speed);
            break;
        }
    }

    cfmakeraw(&tio);
    cfsetispeed(&tio, speedCode);
    cfsetospeed(&tio, speedCode);

    tio.c_cflag |= CLOCAL | CREAD;
    tio.c_cflag &= ~(PARENB | CSTOPB | CSIZE);
    tio.c_cflag |= CS8;
    tio.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG);
    tio.c_oflag &= ~OPOST;

    tio.c_cc[VMIN] = 1;  // read blocks
    tio.c_cc[VTIME] = 0; // no intra-character timeout

    if (tcsetattr(fd, TCSANOW, &tio) != 0) {
        target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);
        return;
    }
}

void LinuxSerialDevice::setRxBufferSize(unsigned size) {
    pthread_mutex_lock(&lock);
    auto tmp = malloc(size);
    if (buffer) {
        auto bsz = bufferedSize();
        if (bsz > (int)size)
            bsz = size;
        readBuf(tmp, bsz);
        readp = 0;
        writep = bsz;
        free(buffer);
    }
    buffer = (uint8_t *)tmp;
    buffersz = size;
    pthread_mutex_unlock(&lock);
}

int LinuxSerialDevice::read() {
    pthread_mutex_lock(&lock);
    uint8_t c;
    int r = readBuf(&c, 1);
    pthread_mutex_unlock(&lock);
    if (r)
        return c;
    return -1;
}

Buffer LinuxSerialDevice::readBuffer() {
    pthread_mutex_lock(&lock);
    int sz = bufferedSize();
    auto r = mkBuffer(NULL, sz);
    int sz2 = readBuf(r->data, sz);
    if (sz != sz2)
        target_panic(999);
    pthread_mutex_unlock(&lock);
    return r;
}

void LinuxSerialDevice::writeBuffer(Buffer buffer) {
    if (NULL == buffer)
        return;
    auto p = buffer->data;
    auto len = buffer->length;
    while (len) {
        int r = write(fd, p, len);
        if (r >= 0) {
            len -= r;
            p += r;
        } else {
            DMESG("serial write error: %d / %d", r, errno);
            break;
        }
    }
}

int LinuxSerialDevice::readBuf(void *buf, int sz) {
    int amount = bufferedSize();
    if (amount < sz)
        sz = amount;
    if (sz > 0) {
        int chunk = buffersz - readp;
        if (chunk > sz)
            chunk = sz;

        memcpy(buf, buffer + readp, chunk);
        readp += chunk;
        if (readp == buffersz)
            readp = 0;
        buf = (uint8_t *)buf + chunk;

        if (sz - chunk > 0) {
            memcpy(buf, buffer + readp, sz - chunk);
            readp += chunk;
        }
    }
    return sz;
}

} // namespace serial
