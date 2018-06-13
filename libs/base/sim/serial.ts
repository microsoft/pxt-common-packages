namespace pxsim.serial {

    export function writeString(str: string) {
        console.log(str);
        runtime.board.writeSerial(str);
    }

    export function writeBuffer(buffer: any) {
        // NOP, can't simulate
    }
    export function sendConsoleToSerial() {
        // DO NO write to console.log
    }
    export function setBaudRate(rate: number) {
        // TODO
    }
    export function redirect(tx: pins.DigitalPin, rx: pins.DigitalPin) {
        // TODO
    }
    export function redirectToUSB() {}
}