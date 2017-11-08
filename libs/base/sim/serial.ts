namespace pxsim.serial {

    export function writeString(str: string) {
        console.log(str);
        runtime.board.writeSerial(str);
    }

    export function writeBuffer(buffer: any) {
        // NOP, can't simulate
    }
}