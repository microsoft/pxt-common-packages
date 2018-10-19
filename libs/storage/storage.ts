/** 
 * File storage operations
*/
//% advanced=true color=#00c0c0 icon="\uf07b"
namespace storage {
    //% shim=storage::init
    function init() { }

    // init() needs to be called at the beginning of the program, so it gets a chance
    // to register its USB handler
    init();

    /**
     * Appends a new line to the file
     */
    //% part="storage" 
    //% blockId="storage_append_line" block="append line file $filename with $data"
    export function appendLine(filename: string, data: string): void {
        append(filename, data + NEW_LINE);
    }

    export let NEW_LINE = "\r\n";
}
