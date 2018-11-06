// Auto-generated. Do not edit.
declare namespace serial {

    /**
     * Read a line of text from the serial port and return the buffer when the delimiter is met.
     * @param delimiter text delimiter that separates each text chunk
     */
    //% help=serial/read-until
    //% blockId=serial_read_until block="serial|read until %delimiter=serial_delimiter_conv"
    //% weight=19 shim=serial::readUntil
    function readUntil(delimiter: string): string;

    /**
     * Read the buffered received data as a string
     */
    //% help=serial/read-string
    //% blockId=serial_read_buffer block="serial|read string"
    //% weight=18 shim=serial::readString
    function readString(): string;

    /**
     * Register an event to be fired when one of the delimiter is matched.
     * @param delimiters the characters to match received characters against.
     */
    //% help=serial/on-data-received
    //% weight=18 blockId=serial_on_data_received block="serial|on data received %delimiters=serial_delimiter_conv" shim=serial::onDataReceived
    function onDataReceived(delimiters: string, body: () => void): void;

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% blockHidden=1 shim=serial::writeString
    function writeString(text: string): void;

    /**
     * Send a buffer across the serial connection.
     */
    //% help=serial/write-buffer weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer" shim=serial::writeBuffer
    function writeBuffer(buffer: Buffer): void;

    /**
    Sends the console message through the TX, RX pins
     **/
    //% blockId=serialsendtoconsole block="serial attach to console" shim=serial::attachToConsole
    function attachToConsole(): void;

    /**
    Set the baud rate of the serial port
     */
    //% blockId=serialsetbaudrate block="serial set baud rate to %rate" shim=serial::setBaudRate
    function setBaudRate(rate: BaudRate): void;

    /**
     * Set the serial input and output to use pins instead of the USB connection.
     * @param tx the new transmission pin, eg: SerialPin.P0
     * @param rx the new reception pin, eg: SerialPin.P1
     * @param rate the new baud rate. eg: 115200
     */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx|at baud rate %rate"
    //% blockExternalInputs=1
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% blockGap=8 inlineInputMode=inline shim=serial::redirect
    function redirect(tx: DigitalInOutPin, rx: DigitalInOutPin, rate: BaudRate): void;
}

// Auto-generated. Do not edit. Really.
