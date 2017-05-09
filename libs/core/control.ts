/**
* Runtime and event utilities.
*/
//% weight=10 color="#31bca3" icon="\uf110" advanced=true
namespace control {

    /**
     * Display specified error code and stop the program.
     */
    // shim=pxtrt::panic
    export function panic(code: number) { }

    /**
     * Display specified error code and stop the program.
     */
    // shim=pxtrt::assert
    export function assert(cond: boolean, code: number) { }

    export function fail(message: string) {
        serial.writeString("Fatal failure: ")
        serial.writeString(message)
        serial.writeString("\r\n")
        panic(108)
    }
}
