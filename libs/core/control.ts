/**
* Runtime and event utilities.
*/
//% weight=10 color="#000000" icon="\uf110" advanced=true
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
}
