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
    //% part="storage" 
    //% blockId="storage_append_line" block="append file $filename with line $data"
    //% data.shadowOptions.toString=true
    export function appendLine(filename: string, data: string): void {
        append(filename, data + NEW_LINE);
    }

    /**
     * Appends a name/value pair
    * @param filename name of the file, eg: "log.txt"
     * @param name 
     * @param value 
     */
    //% part="storage" 
    //% blockId="storage_append_value" block="append file $filename with value $name = $value"
    //% data.shadowOptions.toString=true
    export function appendValue(filename: string, name: string, value: string) {
        append(filename, name ? `${name}: ${value}`: value);
    }

    export let NEW_LINE = "\r\n";
}
