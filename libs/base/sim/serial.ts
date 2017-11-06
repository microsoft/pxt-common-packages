namespace pxsim.serial {
    export function writeLine(line: string) {
        writeString(line + "\n");
    }

    export function writeString(str: string) {
        console.log(str);
        runtime.board.writeSerial(str);
    }

    export function writeNumber(num: number) {
        writeString(num.toString());
    }

    export function writeValue(name: string, value: number) {
        writeString(name + ": " + value);
    }

    export function writeBuffer(buffer: any) {
        // TODO
    }
}