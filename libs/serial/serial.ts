/**
 * Reading and writing data over a serial connection.
 */
//% weight=2 color=#002050 icon="\uf287"
//% advanced=true blockGap=8
//% groups='["Write", "Read", "Events", "Configuration"]'
namespace serial {
    export let NEW_LINE = "\r\n"; // \r require or Putty really unhappy on windows

    export class Serial {
        serialDevice: SerialDevice;
        decoder: UTF8Decoder;
        constructor(serialDevice: SerialDevice) {
            this.serialDevice = serialDevice;
            this.decoder = new UTF8Decoder();
        }

        readString(): string {
            const buf = this.serialDevice.readBuffer();
            this.decoder.add(buf);
            return this.decoder.decode();
        }

        readLine(timeOut?: number): string {
            return serial.readUntil(Delimiters.NewLine, timeOut);
        }

        readUntil(delimiter: Delimiters, timeOut?: number): string {
            const start = control.millis();
            do {
                const s = this.decoder.decodeUntil(delimiter);
                if (s !== undefined)
                    return s;
                const b = this.serialDevice.readBuffer()
                this.decoder.add(b);
                pause(1);
            }
            while (timeOut === undefined || (control.millis() - start < timeOut));
            // giving up
            return "";
        }

        writeString(text: string) {
            if (!text) return;
            const buf = control.createBufferFromUTF8(text);
            this.serialDevice.writeBuffer(buf);
        }
    }

    /**
     * Creates a serial comm device
     * @param tx 
     * @param rx 
     * @param id 
     */
    //% parts=serial
    export function createSerial(tx: DigitalInOutPin, rx: DigitalInOutPin, id: number): Serial {
        const dev = serial.internalCreateSerialDevice(tx, rx, DAL.DEVICE_ID_SERIAL);
        return new Serial(dev);
    }

    let _device: Serial;
    export function device(): Serial {
        if (!_device) {
            const tx = pins.pinByCfg(DAL.CFG_PIN_TX);
            const rx = pins.pinByCfg(DAL.CFG_PIN_RX);
            if (!tx || !rx) return undefined;
            _device = serial.createSerial(tx, rx, DAL.DEVICE_ID_SERIAL);
        }
        return _device;
    }

    /**
    * Read the buffered received data as a string
    */
    //% help=serial/read-string
    //% blockId=serial_read_string block="serial|read string"
    //% weight=18
    //% group="Read"
    export function readString(): string {
        const d = device();
        return d ? d.readString() : "";
    }

    /**
     * Read a line of text from the serial port.
     */
    //% help=serial/read-line
    //% blockId=serial_read_line block="serial|read line"
    //% weight=20 blockGap=8
    //% group="Read"
    export function readLine(): string {
        const d = device();
        return d ? d.readLine() : "";
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
        const d = device();
        return d ? d.readUntil(delimiter, timeOut) : "";
    }

    /**
     * Write some text to the serial port.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text"
    //% group="Write"
    export function writeString(text: string) {
        const d = device();
        if (d) d.writeString(text);
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

    /**
    * Sets the size of the RX buffer in bytes
    */
    //% help=serial/set-rx-buffer-size
    //% blockId=serialsetrxbuffersize block="serial set rx buffer size to $size"
    //% weight=10
    //% group="Configuration"
    export function setRxBufferSize(size: number) {
        const ser = device();
        if (ser)
            ser.serialDevice.setRxBufferSize(size);
    }

    /**
    * Sets the size of the TX buffer in bytes
    */
    //% help=serial/set-tx-buffer-size
    //% blockId=serialsettxbuffersize block="serial set tx buffer size to $size"
    //% weight=9
    //% group="Configuration"
    export function setTxBufferSize(size: number) {
        const ser = device();
        if (ser)
            ser.serialDevice.setTxBufferSize(size);
    }

    /**
    * Reads a single byte from the serial receive buffer. Negative if error, 0 if no data.
    */
    //% Group="Read"
    export function read(): number {
        const ser = device();
        if (ser)
            return ser.serialDevice.read();
        else return DAL.DEVICE_NOT_SUPPORTED;
    }

    /**
    * Read the buffered received data as a buffer
    */
    //% help=serial/read-buffer
    //% blockId=serial_read_buffer block="serial|read buffer"
    //% weight=17
    //% group="Read"
    export function readBuffer(): Buffer {
        const ser = device();
        if (ser)
            return ser.serialDevice.readBuffer();
        else
            return control.createBuffer(0);
    }


    /**
    * Send a buffer across the serial connection.
    */
    //% help=serial/write-buffer weight=6
    //% blockId=serial_writebuffer block="serial|write buffer %buffer"
    //% group="Write"
    export function writeBuffer(buffer: Buffer) {
        const ser = device();
        if (ser)
            ser.serialDevice.writeBuffer(buffer);
    }


    /**
    Set the baud rate of the serial port
    */
    //% weight=10
    //% blockId=serial_setbaudrate block="serial|set baud rate %rate"
    //% blockGap=8 inlineInputMode=inline
    //% help=serial/set-baud-rate
    //% group="Configuration"
    export function setBaudRate(rate: BaudRate) {
        const ser = device();
        if (ser)
            ser.serialDevice.setBaudRate(rate);
    }


    /**
      Sends the console message through the TX, RX pins
      **/
    //% blockId=serialsendtoconsole block="serial attach to console"
    //% group="Configuration"
    export function attachToConsole() {
        console.addListener(logListener)
    }

    function logListener(priority: ConsolePriority, text: string) {
        switch (priority) {
            case ConsolePriority.Debug: writeString("dbg> "); break;
            case ConsolePriority.Error: writeString("err> "); break;
            case ConsolePriority.Warning: writeString("wrn> "); break;
        }
        writeLine(text);
    }


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
    //% group="Configuration"
    export function redirect(tx: DigitalInOutPin, rx: DigitalInOutPin, rate: BaudRate) {
        const ser = device();
        if (ser)
            ser.serialDevice.redirect(tx, rx, rate);
    }

    /**
    * Registers code when serial events happen
    **/
    //% weight=9
    //% help=serial/on-event
    //% blockId=serial_onevent block="serial on %event"
    //% blockGap=8
    //% group="Events"
    export function onEvent(event: SerialEvent, handler: () => void) {
        const ser = device();
        if (ser)
            ser.serialDevice.onEvent(event, handler);
    }

    /**
    * Registers code when a delimiter is received
    **/
    //% weight=10
    //% help=serial/on-delimiter-received
    //% blockId=serial_ondelimiter block="serial on delimiter $delimiter received"
    //% blockGap=8
    //% group="Events"
    export function onDelimiterReceived(delimiter: Delimiters, handler: () => void) {
        const ser = device();
        if (ser)
            ser.serialDevice.onDelimiterReceived(delimiter, handler);
    }
}
