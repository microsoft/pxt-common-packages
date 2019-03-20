#include "pxt.h"

enum class BaudRate {
  //% block=115200
  BaudRate115200 = 115200,
  //% block=57600
  BaudRate57600 = 57600,
  //% block=38400
  BaudRate38400 = 38400,
  //% block=31250
  BaudRate31250 = 31250,
  //% block=28800
  BaudRate28800 = 28800,
  //% block=19200
  BaudRate19200 = 19200,
  //% block=14400
  BaudRate14400 = 14400,
  //% block=9600
  BaudRate9600 = 9600,
  //% block=4800
  BaudRate4800 = 4800,
  //% block=2400
  BaudRate2400 = 2400,
  //% block=1200
  BaudRate1200 = 1200,
  //% block=300
  BaudRate300 = 300
};

enum class SerialEvent {
    //% block="data received"
    DataReceived = CODAL_SERIAL_EVT_DATA_RECEIVED,
    //% block="rx buffer full"
    RxBufferFull = CODAL_SERIAL_EVT_RX_FULL
};

enum class Delimiters {
    //% block="new line"
    NewLine = 10, //'\n',
    //% block=","
    Comma = 44, //',',
    //% block="$"
    Dollar = 36, // '$',
    //% block=":"
    Colon = 58, // ':',
    //% block="."
    Fullstop = 46, //'.',
    //% block="#"
    Hash = 35, //'#',
    //% block=";"
    SemiColumn = 59,
    //% block="space",
    Space = 32,
    //% block="tab"
    Tab = 9, //'\t'
    //% block="pipe"
    Pipe = 124 // `|`,
};

namespace serial {

class CodalSerialDeviceProxy {
private:
  DevicePin* tx;
  DevicePin* rx;
public:
  CODAL_SERIAL ser;
  CodalSerialDeviceProxy* next;

  CodalSerialDeviceProxy(DevicePin* _tx, DevicePin* _rx, uint16_t id)
    : tx(_tx), rx(_rx), ser(*tx, *rx), next(NULL)
  {
    if (id <= 0)
      id = allocateNotifyEvent();
    ser.id = id;
    ser.setBaud((int)BaudRate::BaudRate115200);
  }

  bool matchPins(DevicePin* _tx, DevicePin* _rx) {
          return this->tx == _tx && this->rx == _rx;
  }

  void setRxBufferSize(uint8_t size) {
    ser.setRxBufferSize(size);
  }

  void setTxBufferSize(uint8_t size) {
    ser.setTxBufferSize(size);
  }

  void setBaudRate(BaudRate rate) {
    ser.setBaud((int)rate);
  }

  int read() {
    uint8_t buf[1];
    auto r = ser.read(buf, 1, codal::SerialMode::ASYNC);
    // r < 0 => error
    if (r < 0) return r;
    // r == 0, nothing read
    if (r == 0) return DEVICE_NO_DATA;
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
      decrRC(buf);
      return mkBuffer(NULL, 0);
    }
    if (buf->length != read) {
      auto buf2 = mkBuffer(buf->data, read);
      decrRC(buf);
      buf = buf2;
    }
    return buf;
  }

  void writeBuffer(Buffer buffer) {
    if (NULL == buffer) return;
    ser.send(buffer->data, buffer->length);
  }

  void redirect(DevicePin* tx, DevicePin* rx, BaudRate rate) {
      this->tx = tx;
      this->rx = rx;
      this->ser.redirect(*tx, *rx);
      this->setBaudRate(rate);
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

typedef CodalSerialDeviceProxy* SerialDevice;
static SerialDevice serialDevices(NULL);
/**
* Opens a Serial communication driver
*/
//%
SerialDevice internalCreateSerialDevice(DigitalInOutPin tx, DigitalInOutPin rx, int id) {
  auto dev = serialDevices;
  while(dev) {
    if (dev->matchPins(tx, rx))
      return dev;
    dev = dev->next;
  }

  // allocate new one
  auto ser = new CodalSerialDeviceProxy(tx, rx, id);
  ser->next = serialDevices;
  serialDevices = ser;
  return ser;
}

}

namespace SerialDeviceMethods {
  /**
  * Sets the size of the RX buffer in bytes
  */
  //%
  void setRxBufferSize(SerialDevice device, uint8_t size) {
    device->setRxBufferSize(size);
  }

  /**
  * Sets the size of the TX buffer in bytes
  */
  //%
  void setTxBufferSize(SerialDevice device, uint8_t size) {
    device->setTxBufferSize(size);
  }

  /**
  Set the baud rate of the serial port
  */
  //%
  void setBaudRate(SerialDevice device, BaudRate rate) {
    device->setBaudRate(rate);
  }

  /**
  * Reads a single byte from the serial receive buffer. Negative if error, 0 if no data.
  */
  //%
  int read(SerialDevice device) {
    return device->read();
  }

  /**
  * Read the buffered received data as a buffer
  */
  //%
  Buffer readBuffer(SerialDevice device) {
    return device->readBuffer();
  }

  /**
  * Send a buffer across the serial connection.
  */
  //%
  void writeBuffer(SerialDevice device, Buffer buffer) {
    device->writeBuffer(buffer);
  }
  
  /**
  */
  //%
  void redirect(SerialDevice device, DigitalInOutPin tx, DigitalInOutPin rx, BaudRate rate) {
    device->redirect(tx, rx, rate);
  }

  /**
  * Register code when a serial event occurs
  */
  //%
  void onEvent(SerialDevice device, SerialEvent event, Action handler) {
    device->onEvent(event, handler);
  }

  /**
  * Registers code when a delimiter is received
  **/
  //%
  void onDelimiterReceived(SerialDevice device, Delimiters delimiter, Action handler) {
    device->onDelimiterReceived(delimiter, handler);
  }
}
