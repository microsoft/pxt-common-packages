// Auto-generated. Do not edit.
declare namespace serial {
    
    /**
     * Read a line of text from the serial port and return the buffer when the delimiter is met.
     * @param delimiter text delimiter that separates each text chunk
     */
    //% help=serial/read-until
    //% blockId=serial_read_until block="serial|read until %delimiter=serial_delimiter_conv"
    //% weight=19
    //% group="Read" shim=serial::readUntil
    function readUntil(delimiter: string): string;

    /**
     * Sets the size of the RX buffer in bytes
     */
    //% help=serial/set-rx-buffer-size
    //% blockId=serialsetrxbuffersize block="serial set rx buffer size to $size"
    //% weight=10
    //% group="Configuration" shim=serial::setRxBufferSize
    function setRxBufferSize(size: uint8): void;

    /**
     * Sets the size of the TX buffer in bytes
     */
    //% help=serial/set-tx-buffer-size
    //% blockId=serialsettxbuffersize block="serial set tx buffer size to $size"
    //% weight=9
    //% group="Configuration" shim=serial::setTxBufferSize
    function setTxBufferSize(size: uint8): void;

    /**
     * Read the buffered received data as a string
     */
    //% help=serial/read-string
    //% blockId=serial_read_string block="serial|read string"
    //% weight=18
    //% group="Read" shim=serial::readString
    function readString(): string;

    /**
     * Read the buffered received data as a buffer
     */
    //% help=serial/read-buffer
    //% blockId=serial_read_buffer block="serial|read buffer"
    //% weight=17
    //% group="Read" shim=serial::readBuffer
    function readBuffer(): Buffer;

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% group="Write" shim=serial::writeString
    function writeString(text: string): void;

    /**
     * Send a buffer across the serial connection.
     */
    //% help=serial/write-buffer weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    //% group="Write" shim=serial::writeBuffer
    function writeBuffer(buffer: Buffer): void;

    /**
    Sends the console message through the TX, RX pins
     **/
    //% blockId=serialsendtoconsole block="serial attach to console"
    //% group="Configuration" shim=serial::attachToConsole
    function attachToConsole(): void;

    /**
    Set the baud rate of the serial port
     */
    //% help=serial/set-baud-rate
    //% group="Configuration" shim=serial::setBaudRate
    function setBaudRate(rate: BaudRate): void;

    /**
     * Set the serial input and output to use pins instead of the USB connection.
     * @param tx the new transmission pin
     * @param rx the new reception pin
     * @param rate the new baud rate
     */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx"
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% blockGap=8 inlineInputMode=inline
    //% group="Configuration" shim=serial::redirect
    function redirect(tx: DigitalInOutPin, rx: DigitalInOutPin, rate: BaudRate): void;

    /**
     * Registers code when serial events happen
     **/
    //% weight=9
    //% help=serial/on-event
    //% blockId=serial_onevent block="serial on %event"
    //% blockGap=8
    //% group="Events" shim=serial::onEvent
    function onEvent(event: SerialEvent, handler: () => void): void;
}

// Auto-generated. Do not edit. Really.
