namespace pxsim.serial {
    let rxBuffer: string = ""; // another iframe could write to this
    let _baudRate: number;
    let _tx: pins.DigitalInOutPin;
    let _rx: pins.DigitalInOutPin;

    export function onEvent(event: number, handler: RefAction) {
        pxsim.control.internalOnEvent(DAL.DEVICE_ID_SERIAL, event, handler);        
    }

    export function setTxBufferSize(size: number) {
        // TODO
    }

    export function setRxBufferSize(size: number) {
        // TODO
    }

    export function readUntil(delimiter: string) {
        // TODO
        return "";
    }

    export function readString(): string {
        const r = rxBuffer;
        rxBuffer = "";
        return r;
    }

    export function readBuffer(): RefBuffer {
        const s = readString();
        const buf = control.createBuffer(s.length);
        for(let i = 0; i < s.length; ++i)
            buf.data[i] = s.charCodeAt(i);
        return buf;
    }

    export function writeString(str: string) {
        if (str)
            control.__log(1, str)
    }

    export function writeBuffer(buffer: any) {
        // NOP, can't simulate
    }
    export function attachToConsole() {
        // DO NO write to console.log
    }
    export function setBaudRate(rate: number) {
        _baudRate = rate;
    }
    export function redirect(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number) {
        _tx = tx;
        _rx = rx;
        _baudRate = rate;
    }
}
