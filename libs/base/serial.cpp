#include "pxtbase.h"

//% weight=2 color=#002050 icon="\uf287"
//% advanced=true
namespace serial {
    // note that at least one // followed by % is needed per declaration!

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    void writeString(StringData *text) {
      hf2.sendSerial(text->data, text->len);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer advanced=true weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    void writeBuffer(Buffer buffer) {
      if (!buffer) return;

      ManagedBuffer buf(buffer);
      hf2.sendSerial(buf.getBytes(), buf.length());
    }
}
