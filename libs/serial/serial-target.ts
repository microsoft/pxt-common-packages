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
}
