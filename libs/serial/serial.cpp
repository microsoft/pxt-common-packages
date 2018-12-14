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

enum SerialEvent {
    //% block="data received"
    DataReceived = CODAL_SERIAL_EVT_RX_FULL
};

namespace pxt {
  class WSerial {
    public:
      CODAL_SERIAL serial;
      WSerial()
        : serial(*LOOKUP_PIN(TX), *LOOKUP_PIN(RX))
        {
          serial.setBaud((int)BaudRate::BaudRate115200);
        }
  };

SINGLETON_IF_PIN(WSerial,TX);

}

namespace serial {
    /**
    * Read the buffered received data as a string
    */
    //% help=serial/read-string
    //% blockId=serial_read_buffer block="serial|read string"
    //% weight=18
    //% group="Read"
    String readString() {
      auto service = getWSerial();
      if (NULL == service) return mkString("");
      int n = service->serial.getRxBufferSize();
      if (n == 0) 
        return mkString("");
      auto s = service->serial.read(n, SerialMode::ASYNC);
      return PSTR(s);
    }

    /**
    * Read the buffered received data as a buffer
    */
    //% help=serial/read-buffer
    //% blockId=serial_read_buffer block="serial|read buffer"
    //% weight=17
    //% group="Read"
    Buffer readBuffer() {
      auto service = getWSerial();
      if (NULL == service) return mkBuffer(NULL, 0);
      int n = service->serial.getRxBufferSize();
      if (n == 0) 
        return mkBuffer(NULL, 0);

      auto buf = mkBuffer(NULL, n);
      auto read = service->serial.read(buf->data, buf->length, SerialMode::ASYNC);
      if (read == DEVICE_SERIAL_IN_USE) { // someone else is reading
        decrRC(buf);
        return mkBuffer(NULL, 0);
      }
      if (buf->length != read) {
        auto buf2 = mkBuffer(buf, read);
        decrRC(buf);
        buf = buf2;
      }        
      return buf;
    }

    void send(const char* buffer, int length) {
      // TODO: fix CODAL abstraction
      // getWSerial()->serial.send((uint8_t*)buffer, length * sizeof(char));
      auto service = getWSerial();
      if (NULL == service) return;
      service->serial.printf("%s", buffer);
    }

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% group="Write"
    void writeString(String text) {
      auto service = getWSerial();
      if (NULL == service) return;
      if (NULL == text) return;
      send(text->data, text->length);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    //% group="Write"
    void writeBuffer(Buffer buffer) {
      auto service = getWSerial();
      if (NULL == service) return;
      if (NULL == buffer) return;
      service->serial.send(buffer->data, buffer->length);
    }

    /**
      Sends the console message through the TX, RX pins
      **/
    //% blockId=serialsendtoconsole block="serial attach to console"
    //% group="Configuration"
    void attachToConsole() {
      auto service = getWSerial();
      if (NULL == service) return;
      setSendToUART(serial::send);
    }

    /**
    Set the baud rate of the serial port
    */
    //% help=serial/set-baud-rate
    //% group="Configuration"
    void setBaudRate(BaudRate rate) {
      auto service = getWSerial();
      if (NULL == service) return;
      service->serial.setBaud((int)rate);
    }

    /**
    * Set the serial input and output to use pins instead of the USB connection.
    * @param tx the new transmission pin
    * @param rx the new reception pin
    * @param rate the new baud rate
    */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx"
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% blockGap=8 inlineInputMode=inline
    //% group="Configuration"
    void redirect(DigitalInOutPin tx, DigitalInOutPin rx, BaudRate rate) {
      auto service = getWSerial();
      if (NULL == service) return;
      if (NULL == tx || NULL == rx)
        return;
      service->serial.redirect(*tx, *rx);
      setBaudRate(rate);
    }

    /**
    * Registers code when serial events happen
    **/
    //% weight=9
    //% help=serial/on-event
    //% blockId=serial_onevent block="serial on %event"
    //% blockGap=8
    //% group="Events"
    void onEvent(SerialEvent event, Action handler) {
      auto service = getWSerial();
      if (NULL == service) return;
      auto id = service->serial.id;
      registerWithDal(id, event, handler);
    }
}