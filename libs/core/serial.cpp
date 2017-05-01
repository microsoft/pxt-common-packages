#include "pxt.h"

//% weight=2 color=#002050 icon="\uf287"
//% advanced=true
namespace serial {
    // note that at least one // followed by % is needed per declaration!

    /**
     * Sends a piece of text through Serial connection.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    void writeString(StringData *text) {
      hf2.sendSerial(text->data, text->len);
    }

    /**
    * Sends a buffer through Serial connection
    */
    //% help=serial/write-buffer advanced=true weight=6
    void writeBuffer(Buffer buffer) {
      if (!buffer) return;

      ManagedBuffer buf(buffer);
      hf2.sendSerial(buf.getBytes(), buf.length());
    }
}
