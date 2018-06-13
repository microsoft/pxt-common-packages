#include "pxtbase.h"
#include "pins.h"
#include CODAL_SERIAL_HEADER

namespace pxt {
  class WSerial {
    public:
      CODAL_SERIAL serial;
      WSerial()
        : serial(PIN(TX), PIN(RX))
        {}
  };

SINGLETON(WSerial);

}

enum BaudRate {
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

namespace serial {
    void send(const char* buffer, int length) {
      getWSerial()->serial.send(ManagedString(buffer, length));
    }

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87 blockHidden=true
    //% blockId=serial_writestring block="serial|write string %text"
    //% blockHidden=1
    void writeString(String text) {
      if (NULL == text) return;
      send(text->data, text->length);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer weight=6 blockHidden=true
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    //% blockHidden=1
    void writeBuffer(Buffer buffer) {
      if (NULL == buffer) return;
      getWSerial()->serial.send(buffer->data, buffer->length);
    }

    /**
      Sends the console message through the TX, RX pins
      **/
    //% blockId=serialsendtoconsole block="serial attach to console"
    //% blockHidden=1
    void attachToConsole() {
      setSendToUART(serial::send);
    }

    /**
    Set the baud rate of the serial port
    */
    //% blockId=serialsetbaudrate block="serial set baud rate to %rate"
    //% blockHidden=1
    void setBaudRate(BaudRate rate) {
      getWSerial()->serial.baud(rate);
    }

    /**
      Configure the pins used by the serial interface/
    **/
    /**
    * Set the serial input and output to use pins instead of the USB connection.
    * @param tx the new transmission pin, eg: SerialPin.P0
    * @param rx the new reception pin, eg: SerialPin.P1
    * @param rate the new baud rate. eg: 115200
    */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx|at baud rate %rate"
    //% blockExternalInputs=1
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% blockGap=8
    //% blockHidden=1
    void redirect(DigitalPin tx, DigitalPin rx, BaudRate rate) {
      getWSerial()->serial.redirect((PinName)tx->name, (PinName)rx->name);
      getWSerial()->serial.baud(rate);
    }

    /**
    * Direct the serial input and output to use the USB connection.
    */
    //% weight=9 help=serial/redirect-to-usb
    //% blockId=serial_redirect_to_usb block="serial|redirect to USB"    
    //% blockHidden=1
    void redirectToUSB() {
      getWSerial()->serial.redirect(USBTX, USBRX);
    }
}