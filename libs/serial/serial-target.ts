namespace serial {
    /**
     * Creates a serial comm device
     * @param tx 
     * @param rx 
     * @param id 
     */
    //% help=serial/create-serial
    //% parts=serial
    export function createSerial(tx: DigitalInOutPin, rx: DigitalInOutPin, id?: number): Serial {
        const dev = serial.internalCreateSerialDevice(tx, rx, id || 0);
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
    * Set the serial input and output to use pins instead of the USB connection.
    * @param tx the new transmission pin
    * @param rx the new reception pin
    * @param rate the new baud rate
    */
    //% weight=10
    //% help=serial/redirect
    //% blockId=serial_redirect block="serial|redirect to|TX %tx|RX %rx at rate %rate"
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
}
