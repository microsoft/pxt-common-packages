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
    * @param filename name of the file, eg: "log.txt"
     */
    //% parts="storage" 
    //% blockId="storage_append_line" block="append file $filename with line $data"
    export function appendLine(filename: string, data: string): void {
        append(filename, data);
        append(filename, NEW_LINE);
    }

    /** 
    * Append string data to a new or existing file. 
    * @param filename name of the file, eg: "log.txt"
    */
    //% parts="storage" 
    //% blockId="storage_append" block="append file $filename with $data"
    export function append(filename: string, data: string) {
        appendBuffer(filename, control.createBufferFromUTF8(data));
    }

    export let NEW_LINE = "\r\n";
}
