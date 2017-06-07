#include "pxt.h"
#include "DeviceSerial.h"
#include "pins.h"

#define SERIAL_READ_BUFFER_LENGTH 64

namespace pxt {

// Wrapper classes
class WSerial {
  public:
    DeviceSerial serial;

    WSerial() : serial((PinName)PIN_TX, (PinName)PIN_RX)
    {

    }
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
    //% advanced=true
    void writeStringHf2(StringData *text) {
      hf2.sendSerial(text->data, text->len);
    }

    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer advanced=true weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    void writeBufferHf2(Buffer buffer) {
      if (!buffer) return;

      ManagedBuffer buf(buffer);
      hf2.sendSerial(buf.getBytes(), buf.length());
    }

    /**
     * Reads a line of text from the serial port and returns the buffer when the delimiter is met.
     * @param delimiter text delimiter that separates each text chunk
     */
    //% help=serial/read-until
    //% blockId=pinserial_read_until block="serial|read until %delimiter=serial_delimiter_conv"
    //% weight=19
    StringData* readUntil(StringData* delimiter) {
        auto mSerial = &getWSerial()->serial;
        return mSerial->readUntil(ManagedString(delimiter)).leakData();
    }

    /**
    * Reads the buffered received data as a string
    */
    //% blockId=pinserial_read_buffer block="serial|read string"
    //% weight=18
    StringData* readString() {
        auto mSerial = &getWSerial()->serial;
        int n = mSerial->getRxBufferSize();
        if (n == 0) return ManagedString("").leakData();
        return ManagedString(mSerial->read(n, DeviceSerialMode::ASYNC)).leakData();
    }

    /**
    * Registers an event to be fired when one of the delimiter is matched.
    * @param delimiters the characters to match received characters against.
    */
    //% help=serial/on-data-received
    //% weight=18 blockId=pinserial_on_data_received block="serial|on data received %delimiters=serial_delimiter_conv"
    void onDataReceived(StringData* delimiters, Action body) {
        auto mSerial = &getWSerial()->serial;
        mSerial->eventOn(ManagedString(delimiters));
        registerWithDal(DEVICE_ID_SERIAL, DEVICE_SERIAL_EVT_DELIM_MATCH, body);
        // lazy initialization of serial buffers
        mSerial->read(DeviceSerialMode::ASYNC);
    }

    /**
     * Sends a piece of text through Serial connection.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=pinserial_writestring block="serial|write string %text"
    void writeString(StringData *text) {
        if (!text) return;
        auto mSerial = &getWSerial()->serial;

        mSerial->send(ManagedString(text));
    }

    /**
    * Sends a buffer through Serial connection
    */
    //% help=serial/write-buffer advanced=true weight=6
    void writeBuffer(Buffer buffer) {
        if (!buffer) return;
        auto mSerial = &getWSerial()->serial;

        ManagedBuffer buf(buffer);
        mSerial->send(buf.getBytes(), buf.length());
    }

    /**
    * Reads multiple characters from the rxBuff and fills a user buffer.
    * @param length default buffer length, eg: 64
    */
    //% help=serial/read-buffer advanced=true weight=5
    Buffer readBuffer(int length) {
         if (length <= 0)
            length = SERIAL_READ_BUFFER_LENGTH;
            
        ManagedBuffer buf(length);
        auto mSerial = &getWSerial()->serial;
        int read = mSerial->read(buf.getBytes(), buf.length());
        if (read != buf.length())
            buf = buf.slice(read);

        return buf.leakData();
    }
}
