/**
* Program controls and events.
*/
//% weight=10 color="#31bca3" icon="\uf110" advanced=true
namespace control {

    /**
     * Display an error code and stop the program.
     * @param code an error number to display. eg: 5
     */
    //% help=control/panic weight=29
    //% blockId="control_panic" block="panic %code"
    //% shim=pxtrt::panic
    export function panic(code: number) { }

    /**
     * Display an error code and stop the program when the assertion is `false`.
     */
    //% help=control/assert weight=30
    //% blockId="control_assert" block="assert %cond|with value %code"
    export function assert(cond: boolean, code: number) {
        if (!cond) {
            fail("Assertion failed, code=" + code)
        }
    }

    export function fail(message: string) {
        serial.writeString("Fatal failure: ")
        serial.writeString(message)
        serial.writeString("\r\n")
        panic(108)
    }
}


/**
 * Tagged hex literal converter
 */
//% shim=@hex
function hex(lits: any, ...args: any[]): Buffer { return null }