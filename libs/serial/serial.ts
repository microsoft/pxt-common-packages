/**
 * Reading and writing data over a serial connection.
 */
//% weight=2 color=#002050 icon="\uf287"
//% advanced=true blockGap=8
//% groups='["Write", "Read", "Events", "Configuration"]'
namespace serial {
    export let NEW_LINE = "\r\n"; // \r require or Putty really unhappy on windows

    /**
    * Read the buffered received data as a string
    */
    //% help=serial/read-string
    //% blockId=serial_read_string block="serial|read string"
    //% weight=18
    //% group="Read"
    export function readString(): string {
        const buf = serial.readBuffer();
        return buf.toString();
    }

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% group="Write"
    export function writeString(text: string) {
        const buf = control.createBufferFromUTF8(text);
        serial.writeBuffer(buf);
    }

    /**
     * Read a line of text from the serial port.
     */
    //% help=serial/read-line
    //% blockId=serial_read_line block="serial|read line"
    //% weight=20 blockGap=8
    //% group="Read"
    export function readLine(): string {
        return serial.readUntil(Delimiters.NewLine);
    }

    /**
     * Read a line of text from the serial port and return the buffer when the delimiter is met.
     * @param delimiter text delimiter that separates each text chunk
     */
    //% help=serial/read-until
    //% blockId=serial_read_until block="serial|read until %delimiter=serial_delimiter_conv"
    //% weight=19
    //% group="Read"    
    export function readUntil(delimiter: Delimiters, timeOut?: number): string {
        const start = control.millis();
        let r = "";
        let buf = control.createBuffer(3);
        let bufi = 0;
        while(timeOut === undefined || (control.millis() - start < timeOut)) {
            const c = serial.read();
            if (c == DAL.DEVICE_NOT_SUPPORTED) // serial not supported
                return r;
            else if (c == DAL.DEVICE_NO_DATA) { // no data, sleep and try again
                pause(1);
                continue;
            }
            else if (c < 0) // error -- return what we have so far
                break;
            // store in temp buffer
            buf[bufi++] = c;
            // commit completed letter
            if (bufi == 1 && (buf[0] & 0x80) == 0) {
                if (buf[0] == delimiter)
                    break; // found the delimiter!
                r += String.fromCharCode(buf[0]);
                bufi = 0;
            } else if (bufi == 2 && (c & 0xe0) == 0xc0) {
                r += String.fromCharCode(((buf[0] & 0x1f) << 6) | (buf[1] & 0x3f));
                bufi = 0;
            } else if (bufi == 3) {
                if ((c & 0xf0) == 0xe0) {
                    r += String.fromCharCode(((buf[0] & 0x0f) << 12) | (buf[1] & 0x3f) << 6 | (buf[2] & 0x3f));
                    bufi = 0;
                } else {
                    // error...
                    break;
                }
            }
        }
        return r;
    }

    /**
     * Write a line of text to the serial port.
     * @param value to send over serial
     */
    //% weight=90
    //% help=serial/write-line blockGap=8
    //% blockId=serial_writeline block="serial|write line %text"
    //% group="Write"
    export function writeLine(text: string): void {
        writeString(text);
        writeString(NEW_LINE);
    }

    /**
     * Write a number to the serial port.
     */
    //% help=serial/write-number
    //% weight=89 blockGap=8
    //% blockId=serial_writenumber block="serial|write number %value"
    //% group="Write"
    export function writeNumber(value: number): void {
        writeString(value.toString());
    }

    /**
     * Write a name:value pair as a line of text to the serial port.
     * @param name name of the value stream, eg: "x"
     * @param value to write
     */
    //% weight=88 blockGap=8
    //% help=serial/write-value
    //% blockId=serial_writevalue block="serial|write value %name|= %value"
    //% group="Write"
    export function writeValue(name: string, value: number): void {
        if (name) {
            writeString(name);
            writeString(":");
        }
        writeNumber(value);
        writeString(NEW_LINE);
    }
}
