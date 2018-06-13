#include "pxtbase.h"

#ifdef CODAL_SERIAL
namespace pxt {
  class WSerial {
    public:
      CODAL_SERIAL serial;
      WSerial()
        : serial(LOOKUP_PIN(TX), LOOKUP_PIN(RX))
        {}
  }
  SINGLETON(WSerial);
}
#endif

namespace serial {
    void write(const char* buffer, int length) {
      #if CODAL_SERIAL
      getWSerial()->serial.write(text->data, text->length);
      #endif
    }
    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87 blockHidden=true
    //% blockId=serial_writestring block="serial|write string %text"
    void writeString(String text) {
      if (NULL == text) return;
      write(text->data, text->length);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer weight=6 blockHidden=true
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    void writeBuffer(Buffer buffer) {
      if (NULL == buffer) return;
      write((char*)buffer->data, buffer->length);
    }
}

namespace console {
    /**
      Sends the console message through the TX, RX pins
      **/
    //% weight=1
    //% blockId=consolesendtoserial block="send console to serial"
    void sendConsoleToSerial() {
      #if CODAL_SERIAL
        setSendToUART(serial.write)
      #endif
    }
}