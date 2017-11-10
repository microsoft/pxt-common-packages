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
    //% help=serial/write-line blockGap=8 blockHidden=true
    //% blockId=serial_writeline block="serial|write line %text"
    export function writeLine(text: string): void {
        writeString(text + "\r\n");
    }

    /**
     * Write a number to the serial port.
     */
    //% help=serial/write-number
    //% weight=89 blockGap=8 blockHidden=true
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
    //% help=serial/write-value blockHidden=true
    //% blockId=serial_writevalue block="serial|write value %name|= %value"
    export function writeValue(name: string, value: number): void {
        const prefix = name ? name + ":" : "";
        serial.writeLine(prefix + value);
    }

}
