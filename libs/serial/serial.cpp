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

enum Delimiters {
    //% block="new line"
    NewLine = 1,
    //% block=","
    Comma = 2,
    //% block="$"
    Dollar = 3,
    //% block=":"
    Colon = 4,
    //% block="."
    Fullstop = 5,
    //% block="#"
    Hash = 6,
};

namespace pxt {
  class WSerial {
    public:
      CODAL_SERIAL serial;
      WSerial()
        : serial(*LOOKUP_PIN(TX), *LOOKUP_PIN(RX))
        {
          serial.baud((int)BaudRate::BaudRate115200);
        }
  };

SINGLETON(WSerial);

}

namespace serial {

    //%
    String readUntil(String delimiter) {
      auto f = getWSerial()->serial.readUntil(delimiter->data);
      auto res = mkString(f.toCharArray(), f.length());
      return res;
    }

    //%
    String readString() {
      int n = getWSerial()->serial.getRxBufferSize();
      if (n == 0) return mkString("", 0);
      auto f = getWSerial()->serial.read(n, SerialMode::ASYNC);
      auto res = mkString(f.toCharArray(), f.length());
      return res;
    }

    //%
    void onDataReceived(String delimiters, Action body) {
      getWSerial()->serial.eventOn(delimiters->data);
      registerWithDal(DEVICE_ID_SERIAL, CODAL_SERIAL_EVT_DELIM_MATCH, body);
      // lazy initialization of serial buffers
      getWSerial()->serial.read(SerialMode::ASYNC);
    }

    void send(const char* buffer, int length) {
      // TODO: fix CODAL abstraction
      // getWSerial()->serial.send((uint8_t*)buffer, length * sizeof(char));
      getWSerial()->serial.printf("%s", buffer);
    }

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% blockHidden=1
    void writeString(String text) {
      if (NULL == text) return;
      send(text->data, text->length);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    void writeBuffer(Buffer buffer) {
      if (NULL == buffer) return;
      getWSerial()->serial.send(buffer->data, buffer->length);
    }

    /**
      Sends the console message through the TX, RX pins
      **/
    //% blockId=serialsendtoconsole block="serial attach to console"
    void attachToConsole() {
      setSendToUART(serial::send);
    }

    /**
    Set the baud rate of the serial port
    */
    //% help=serial/set-baud-rate
    //% blockId=serialsetbaudrate block="serial set baud rate to %rate"
    void setBaudRate(BaudRate rate) {
      getWSerial()->serial.baud((int)rate);
    }

    /**
    * Set the serial input and output to use pins instead of the USB connection.
    * @param tx the new transmission pin, eg: SerialPin.P0
    * @param rx the new reception pin, eg: SerialPin.P1
    */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx"
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% blockGap=8 inlineInputMode=inline
    void redirect(DigitalInOutPin tx, DigitalInOutPin rx) {
      getWSerial()->serial.redirect((PinName)tx->name, (PinName)rx->name);
    }
}