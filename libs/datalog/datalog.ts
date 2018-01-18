//% weight=100 color=#0fbc11 icon=""
namespace datalog {
    export class DatalogStorage {
        constructor() { }
        init(filename: string): void { }
        appendHeaders(headers: string[]): void { }
        appendRow(values: number[]): void { }
        flush(): void { }
    }

    let _headers: string[] = undefined;
    let _headersWritten: boolean = false;
    let _values: number[] = undefined;
    let _start: number;
    let _filename = "datalog.csv";
    let _storage: DatalogStorage;
    let _enabled = true;

    function clear() {
        _headers = undefined;
        _values = undefined;
    }

    function init() {
        if (!_headers) {
            _headers = [];
            _headersWritten = false;
            _start = control.millis();
            if (_storage) _storage.init(_filename);
        }
        _values = [];
    }

    function commit() {
        // write row if any data
        if (_values && _values.length > 0) {
            if (_storage) {
                // write headers for the first row
                if (!_headersWritten) {
                    _storage.appendHeaders(_headers);
                    _headersWritten = true;
                }
                // commit row data
                _storage.appendRow(_values);
            }
        }

        // clear values
        _values = undefined;
    }

    /**
     * Starts a row of data
     */
    //% weight=100
    //% blockId=datalogAddRow block="datalog add row"
    export function addRow(): void {
        if (!_enabled) return;

        commit();
        init();
        const s = (control.millis() - _start) / 1000;
        addValue("time (s)", s);
    }

    /**
     * Adds a cell to the row of data
     * @param name name of the cell, eg: "x"
     * @param value value of the cell, eg: 0
     */
    //% weight=99
    //% blockId=datalogAddValue block="datalog add %name|=%value"
    export function addValue(name: string, value: number) {
        if (!_values) return;
        let i = _headers.indexOf(name);
        if (i < 0) {
            _headers.push(name);
            i = _headers.length - 1;
        }
        _values[i] = value;
    }

    /**
     * Starts a new data logger for the given file
     * @param filename the filename, eg: "datalog.csv"
     */
    //%
    export function setFile(filename: string) {
        flush();
        _filename = filename;
        clear();
    }

    /**
     * 
     * @param storage custom storage solution
     */
    //%
    export function setStorage(storage: DatalogStorage) {
        flush();
        _storage = storage;
        clear();
    }

    /**
     * Commits any buffered row to disk
     */
    //%
    export function flush() {
        if (_headers && _storage)
            _storage.flush();
    }

    /**
     * Turns on or off datalogging
     * @param enabled 
     */
    //% blockId=datalogEnabled block="datalog %enabled"
    //% enabled.fieldEditor=fieldonoff
    export function setEnabled(enabled: boolean) {
        flush();
        _enabled = enabled;
    }
}
