/**
 * Reading and writing data over a serial connection.
 */
//% weight=2 color=#002050 icon="\uf287"
//% advanced=true
namespace serial {
    /**
     * Write a line of text to the serial port.
     * @param value to send over serial
     */
    //% weight=90
    //% help=serial/write-line blockGap=8
    //% blockId=serial_writeline block="serial|write line %text"
    export function writeLine(text: string): void {
        writeString(text + "\r\n");
    }

    /**
     * Write a number to the serial port.
     */
    //% help=serial/write-number
    //% weight=89 blockGap=8
    //% blockId=serial_writenumber block="serial|write number %value"
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
    export function writeValue(name: string, value: number): void {
        const prefix = name ? name + ":" : "";
        serial.writeLine(prefix + value);
    }
    
    /**
     * Read a line of text from the serial port and return the buffer when the delimiter is met.
     * @param delimiter text delimiter that separates each text chunk
     */
    //% help=serial/read-until
    //% blockId=serial_readUntil block="serial|read until %delimiter=serial_delimiter_conv"
    //% weight=19
    export function readUntil(del: string): string {
        return readString();
    }
    
    /**
    * Read the buffered received data as a string
    */
    //% help=serial/read-string
    //% blockId=serial_read_buffer block="serial|read string"
    //% weight=18
    export function readString(): string {
        return ""
    }


        /**
     * Return the corresponding delimiter string
     */
    //% blockId="serial_delimiter_conv" block="%del"
    //% weight=1 blockHidden=true
    export function delimiters(del: Delimiters): string {
        // even though it might not look like, this is more
        // (memory) efficient than the C++ implementation, because the
        // strings are statically allocated and take no RAM
        switch (del) {
            case Delimiters.NewLine: return "\n"
            case Delimiters.Comma: return ","
            case Delimiters.Dollar: return "$"
            case Delimiters.Colon: return ":"
            case Delimiters.Fullstop: return "."
            case Delimiters.Hash: return "#"
            default: return "\n"
        }
    }
}
