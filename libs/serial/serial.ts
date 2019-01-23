/**
 * Reading and writing data over a serial connection.
 */
//% weight=2 color=#002050 icon="\uf287"
//% advanced=true blockGap=8
//% groups='["Write", "Read", "Events", "Configuration"]'
namespace serial {
    export let NEW_LINE = "\r\n"; // \r require or Putty really unhappy on windows

    class UTF8Decoder {
        private buf: Buffer;

        constructor() {
            this.buf = undefined;
        }

        add(buf: Buffer) {
            if (!this.buf)
                this.buf = buf;
            else {
                const b = control.createBuffer(this.buf.length + buf.length);
                b.write(0, this.buf);
                b.write(this.buf.length, buf);
                this.buf = b;
            }
        }

        decode(): string {
            if (!this.buf) return "";

            // scan the end of the buffer for partial characters
            let length = 0;
            for (let i = this.buf.length - 1; i >= 0; i--) {
                const c = this.buf[i];
                if ((c & 0x80) == 0) {
                    length = i + 1;
                    break;
                }
                else if ((c & 0xe0) == 0xc0) {
                    length = i + 2;
                    break;
                }
                else if ((c & 0xf0) == 0xe0) {
                    length = i + 3;
                    break;
                }
            }
            // is last beyond the end?
            if (length == this.buf.length) {
                const s = this.buf.toString();
                this.buf = undefined;
                return s;
            } else if (length == 0) // data yet
                return "";
            else {
                const s = this.buf.slice(0, length).toString();
                this.buf = this.buf.slice(length);
                return s;
            }
        }
    }
    let _decoder: UTF8Decoder;
    function decoder(): UTF8Decoder {
        if (!_decoder)
            _decoder = new UTF8Decoder();
        return _decoder;
    }

    /**
    * Read the buffered received data as a string
    */
    //% help=serial/read-string
    //% blockId=serial_read_string block="serial|read string"
    //% weight=18
    //% group="Read"
    export function readString(): string {
        const buf = serial.readBuffer();
        const d = decoder();
        d.add(buf);
        return d.decode();
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
        const d = decoder();
        let r = "";
        while (timeOut === undefined || (control.millis() - start < timeOut)) {
        }
        return r;
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
