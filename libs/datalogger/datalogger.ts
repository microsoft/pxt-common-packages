enum LogSeparator {
    //% block="tab"
    Tab = 0x09,
    //% block="comma"
    Comma = 0x2c,
    //% block="semicolon"
    Semicolon = 0x3b
};

/**
 * A tiny data logging framework
 */
//% weight=80 color=#00a0a0 icon="" blockGap=8
//% groups='["Data", "Configuration"]'
namespace datalogger {
    export let SEPARATOR = "\t";
    /**
     * A storage for log data
     */
    export class Storage {
        constructor() {
        }
        /**
         * Initializes the storage
         */
        init(): void { }
        /**
         * Appends the headers in log
         */
        appendHeaders(headers: string[]): void { }
        /**
         * Appends a row of data
         */
        appendRow(values: number[]): void { }
        /**
         * Flushes any buffered data
         */
        flush(): void { }
    }

    let _headers: string[] = undefined;
    let _headersWritten: boolean = false;
    let _row: number[] = undefined;
    let _start: number;
    let _storage: Storage;
    let _enabled = true;
    let _samplingInterval = -1;
    let _sampleCount = 0;
    let _lastSampleTime = -1;
    let _console = false;

    function clear() {
        _headers = undefined;
        _row = undefined;
    }

    function initRow() {
        if (!_storage || _row) return;

        if (!_headers) {
            _headers = [];
            _headersWritten = false;
            _start = control.millis();
            _storage.init();
        }
        _row = [];
        _sampleCount = 1;
        _lastSampleTime = control.millis();
        const s = (_lastSampleTime - _start) / 1000;
        addValue("time (s)", s);
    }

    function commitRow() {
        // write row if any data
        if (_row && _row.length > 0 && _storage) {
            // write headers for the first row
            if (!_headersWritten) {
                _storage.appendHeaders(_headers);
                if (_console)
                    console.log(_headers.slice(1, _headers.length).join(', '));
                _headersWritten = true;
            }
            // commit row data
            if (_samplingInterval <= 0 || control.millis() - _lastSampleTime >= _samplingInterval) {
                // average data
                if (_sampleCount > 1) {
                    for(let i = 1; i < _row.length; ++i) {
                        _row[i] /= _sampleCount;
                    }
                }
                // append row
                _storage.appendRow(_row);
                if (_console) {
                    // drop time
                    console.log(_row.slice(1, _row.length).join(','));
                }
                // clear values
                _row = undefined;
                _sampleCount = 1;
                _lastSampleTime = -1;
            } else {
                // don't store the data yet
                _sampleCount++;
            }
        }
    }

    /**
     * Starts a new row of data
     */
    //% group="Data"
    //% weight=100
    //% blockId=datalogAddRow block="data logger add row"
    export function addRow(): void {
        if (!_enabled || !_storage) return;

        commitRow();
        initRow();
    }

    /**
     * Adds a cell to the row of data
     * @param name name of the cell, eg: "x"
     * @param value value of the cell, eg: 0
     */
    //% group="Data"
    //% weight=99
    //% blockId=datalogAddValue block="data logger add %name|=%value"
    //% blockGap=12
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
            _row[i] += value;
        }
    }

    /**
     * 
     * @param storage custom storage solution
     */
    //%
    export function setStorage(storage: Storage) {
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
     * Sets the minimum number of milli seconds between rows
     * @param millis milliseconds between each sample, eg: 50
     */
    //% group="Configuration"
    //% blockId=datalogSetSamplingInterval block="set data logger sampling interval to $millis|(ms)"
    //% millis.shadow=timePicker
    export function setSampleInterval(millis: number) {
        _samplingInterval = millis >> 0;
    }

    /**
     * Turns on or off datalogging
     * @param enabled 
     */
    //% group="Configuration"
    //% blockId=datalogEnabled block="data logger $enabled"
    //% enabled.shadow=toggleOnOff
    export function setEnabled(enabled: boolean) {
        flush();
        _enabled = enabled;
    }

    /**
     * Send the data logger output to the console
     * @param enabled 
     */
    //% group="Configuration"
    //% blockId="datalogConsole" block="data logger to console $enabled"
    //% enabled.shadow=toggleOnOff
    export function sendToConsole(enabled: boolean) {
        _console = enabled;
    }

    /**
     * Set the character used to separate values in a row.
     * @param separator the value separator character, eg: "\t"
     */
    //% group="Configuration"
    //% blockId="datalogSeparator" block="data logger set separator $separator"
    export function setSeparator(separator: LogSeparator) {
        if (!_enabled) {
            SEPARATOR = String.fromCharCode(separator);
        }
    }
}
