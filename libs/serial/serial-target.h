#pragma once
#include "pxt.h"
#include "Serial.h"

enum class SerialEvent;
enum class BaudRate;
enum class Delimiters;

namespace serial {

class CodalSerialDeviceProxy {
  private:
    DevicePin *tx;
    DevicePin *rx;

  public:
    CODAL_SERIAL ser;
    CodalSerialDeviceProxy *next;

    CodalSerialDeviceProxy(DevicePin *_tx, DevicePin *_rx, uint16_t id)
        : tx(_tx), rx(_rx), ser(*tx, *rx), next(NULL) {
        if (id <= 0)
            id = allocateNotifyEvent();
        ser.id = id;
        ser.setBaud(115200);
    }

    bool matchPins(DevicePin *_tx, DevicePin *_rx) { return this->tx == _tx && this->rx == _rx; }

    void setRxBufferSize(uint8_t size) { ser.setRxBufferSize(size); }

    void setTxBufferSize(uint8_t size) { ser.setTxBufferSize(size); }

    void setBaudRate(int rate) { ser.setBaud(rate); }

    int read() {
        uint8_t buf[1];
        auto r = ser.read(buf, 1, codal::SerialMode::ASYNC);
        // r < 0 => error
        if (r < 0)
            return r;
        // r == 0, nothing read
        if (r == 0)
            return DEVICE_NO_DATA;
        // read 1 char
        return buf[0];
    }

    Buffer readBuffer() {
        int n = ser.getRxBufferSize();
        // n maybe 0 but we still call read to force
        // to initialize rx
        auto buf = mkBuffer(NULL, n);
        auto read = ser.read(buf->data, buf->length, SerialMode::ASYNC);
        if (read == DEVICE_SERIAL_IN_USE || read == 0) { // someone else is reading
            return mkBuffer(NULL, 0);
        }
        if (buf->length != read) {
            registerGCObj(buf);
            auto buf2 = mkBuffer(buf->data, read);
            unregisterGCObj(buf);
            buf = buf2;
        }
        return buf;
    }

    void writeBuffer(Buffer buffer) {
        if (NULL == buffer)
            return;
        ser.send(buffer->data, buffer->length);
    }

    void redirect(DevicePin *tx, DevicePin *rx, BaudRate rate) {
        this->tx = tx;
        this->rx = rx;
        this->ser.redirect(*tx, *rx);
        this->setBaudRate((int)rate);
    }

    void onEvent(SerialEvent event, Action handler) {
        ser.setRxBufferSize(ser.getRxBufferSize()); // turn on reading
        registerWithDal(ser.id, (int)event, handler);
    }

    void onDelimiterReceived(Delimiters delimiter, Action handler) {
        registerWithDal(ser.id, CODAL_SERIAL_EVT_DELIM_MATCH, handler);
        ManagedString d((char)delimiter);
        ser.eventOn(d);
    }
};

typedef CodalSerialDeviceProxy *SerialDevice;

} // namespace serial
