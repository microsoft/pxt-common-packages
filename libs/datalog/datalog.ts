//% weight=100 color=#0fbc11 icon=""
namespace datalog {
    export interface DatalogStorage {
        init(filename: string): void;
        appendHeaders(headers: string[]): void;
        appendRow(values: number[]): void;
        flush(): void;
    }

    let _headers: string[] = undefined;
    let _headersWritten: boolean = false;
    let _row: number[] = undefined;
    let _start: number;
    let _filename = "datalog.csv";
    let _storage: DatalogStorage;
    let _enabled = true;

    function clear() {
        _headers = undefined;
        _row = undefined;
    }

    function initRow() {
        if (!_storage) return;

        if (!_headers) {
            _headers = [];
            _headersWritten = false;
            _start = control.millis();
            _storage.init(_filename);
        }
        _row = [];
    }

    function commitRow() {
        // write row if any data
        if (_row && _row.length > 0 && _storage) {
            // write headers for the first row
            if (!_headersWritten) {
                _storage.appendHeaders(_headers);
                _headersWritten = true;
            }
            // commit row data
            _storage.appendRow(_row);
        }

        // clear values
        _row = undefined;
    }

    /**
     * Starts a row of data
     */
    //% weight=100
    //% blockId=datalogAddRow block="datalog add row"
    export function addRow(): void {
        if (!_enabled && _storage) return;

        commitRow();
        initRow();
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
        if (!_row) return;
        // happy path
        if (_headers[_row.length] === name)
            _row.push(value);
        else {
            let i = _headers.indexOf(name);
            if (i < 0) {
                _headers.push(name);
                i = _headers.length - 1;
            }
            _row[i] = value;
        }
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
