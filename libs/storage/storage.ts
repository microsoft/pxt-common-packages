namespace storage {
    //% shim=storage::init
    function init() { }

    // init() needs to be called at the beginning of the program, so it gets a chance
    // to register its USB handler
    init();

    /** Append a CSV line to a file. */
    export function appendCSV(filename: string, data: number[]) {
        let s = ""
        for (let d of data) {
            if (s) s += ","
            s = s + d
        }
        s += "\n"
        append(filename, s)
    }
}
