namespace serial {
    let _device: Serial;
    export function device(): Serial {
        if (!_device) {
            _device = new Serial(serial.internalCreateSerialDevice(0));
        }
        return _device;
    }
}
