
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
    export function internalCreateSerialDevice(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number): SerialDevice {
        const b = board() as EdgeConnectorBoard;
        return b && b.edgeConnectorState ? b.edgeConnectorState.createSerialDevice(tx, rx, id) : new SerialDevice(tx, rx, id);
    }
}
