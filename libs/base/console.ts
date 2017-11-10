/// <reference no-default-lib="true"/>

/**
 * Reading and writing data to the console output.
 */
//% weight=12 color=#002050 icon="\uf120"
//% advanced=true
namespace console {
    /**
     * Write a line of text to the console output.
     * @param value to send
     */
    //% weight=90
    //% help=console/log blockGap=8
    //% blockId=console_log block="console|log %text"
    export function log(text: string): void {
        serial.writeString(text + "\r\n");
    }

    /**
     * Write a name:value pair as a line of text to the console output.
     * @param name name of the value stream, eg: "x"
     * @param value to write
     */
    //% weight=88 blockGap=8
    //% help=console/log-value
    //% blockId=console_log_value block="console|log value %name|= %value"
    export function logValue(name: string, value: number): void {
        serial.writeValue(name, value);
    }
}