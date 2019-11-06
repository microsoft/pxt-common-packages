#include "pxt.h"
#include "serial-target.h"

namespace serial {

static SerialDevice serialDevices(NULL);
/**
 * Opens a Serial communication driver
 */
//%
SerialDevice internalCreateSerialDevice(int id) {
    return new LinuxSerialDevice(id);
}

void LinuxSerialDevice::setRxBufferSize(unsigned size) {
    pthread_mutex_lock(&lock);
    auto tmp = malloc(size);
    if (buffer) {
        auto bsz = bufferedSize();
        if (bsz > size)
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
