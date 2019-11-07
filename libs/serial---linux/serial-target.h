#pragma once
#include "pxt.h"

#include <pthread.h>

#define CODAL_SERIAL_EVT_DELIM_MATCH      1
#define CODAL_SERIAL_EVT_HEAD_MATCH       2
#define CODAL_SERIAL_EVT_RX_FULL          3
#define CODAL_SERIAL_EVT_DATA_RECEIVED    4

enum class SerialEvent;
enum class BaudRate;
enum class Delimiters;

namespace serial {

class LinuxSerialDevice {
    void init();
    uint16_t id;
    uint8_t *buffer;
    int delim;
    unsigned readp, writep, buffersz;
    pthread_mutex_t lock;
    int fd;

  public:
    LinuxSerialDevice *next;

    LinuxSerialDevice(uint16_t id) : id(id) {
        readp = writep = buffersz = 0;
        buffer = NULL;
        next = NULL;
        delim = -1;
        fd = -1;
        pthread_mutex_init(&lock, NULL);
        init();
    }

    void setBaudRate(int rate);
    void setRxBufferSize(unsigned size);

    void setTxBufferSize(unsigned size) {}

    int read();
    Buffer readBuffer();
    void writeBuffer(Buffer buffer);

    void onEvent(SerialEvent event, Action handler) { registerWithDal(id, (int)event, handler); }

    void onDelimiterReceived(Delimiters delimiter, Action handler) {
        registerWithDal(id, CODAL_SERIAL_EVT_DELIM_MATCH, handler);
        delim = (int)delimiter;
    }

  private:
    int bufferedSize() {
        int amount = writep - readp;
        if (amount < 0)
            amount += buffersz;
        return amount;
    }

    int readBuf(void *buf, int sz);

    static void *readLoop(void*);
    void readLoopInner();
};

typedef LinuxSerialDevice *SerialDevice;

} // namespace serial
