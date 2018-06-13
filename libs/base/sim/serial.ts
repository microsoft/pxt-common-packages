namespace pxsim.serial {
    export function writeString(str: string) {
        if (str)
            control.__log(str)
    }

    export function writeBuffer(buffer: any) {
        // NOP, can't simulate
    }
    export function attachToConsole() {
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
