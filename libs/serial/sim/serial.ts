namespace pxsim {
    export class SerialDevice {
        private baudRate: number;
        private rxBuffer: RefBuffer;
        private txBuffer: RefBuffer;

        constructor(private tx: pins.DigitalInOutPin, private rx: pins.DigitalInOutPin, private id: number) {
            this.baudRate = 115200;
            this.setRxBufferSize(64);
            this.setTxBufferSize(64);
        }

        setTxBufferSize(size: number) {
            this.txBuffer = control.createBuffer(size);
        }

        setRxBufferSize(size: number) {
            this.rxBuffer = control.createBuffer(size);
        }

        read(): number {
            return -1;
        }

        readBuffer(): RefBuffer {
            const buf = control.createBuffer(0);
            return buf;
        }

        writeBuffer(buffer: any) {
        }

        setBaudRate(rate: number) {
            this.baudRate = rate;
        }

        redirect(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number) {
            this.tx = tx;
            this.rx = rx;
            this.baudRate = rate;
        }

        onEvent(event: number, handler: RefAction) {
            pxsim.control.internalOnEvent(this.id, event, handler);
        }

        onDelimiterReceived(delimiter: number, handler: RefAction): void {
            // TODO
        }
    }
}

namespace pxsim.SerialDeviceMethods {
    export function setTxBufferSize(device: SerialDevice, size: number) {
        device.setTxBufferSize(size);
    }
    export function setRxBufferSize(device: SerialDevice, size: number) {
        device.setRxBufferSize(size);
    }

    export function read(device: SerialDevice): number {
        return device.read();
    }

    export function readBuffer(device: SerialDevice): RefBuffer {
        return device.readBuffer();
    }

    export function writeBuffer(device: SerialDevice, buffer: RefBuffer) {
        device.writeBuffer(buffer);
    }

    export function setBaudRate(device: SerialDevice, rate: number) {
        device.setBaudRate(rate);
    }

    export function redirect(device: SerialDevice, tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number) {
        device.redirect(tx, rx, rate);
    }

    export function onEvent(device: SerialDevice, event: number, handler: RefAction) {
        device.onEvent(event, handler);
    }

    export function onDelimiterReceived(device: SerialDevice, delimiter: number, handler: RefAction): void {
        device.onDelimiterReceived(delimiter, handler);
    }
}

namespace pxsim.serial {
    export function createSerial(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number): SerialDevice {
        return new SerialDevice(tx, rx, id);
    }

    export function device(): SerialDevice {
        const b = board() as pxsim.EdgeConnectorBoard;
        return b && b.edgeConnectorState && b.edgeConnectorState.serial;
    }
}
