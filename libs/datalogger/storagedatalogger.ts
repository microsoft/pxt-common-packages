namespace datalogger {
    const FILENAME = "datalog.csv";
    /**
        * A storage for datalog data
    */
    export class FileStorage extends Storage {
        filename: string;
        constructor(filename: string) {
            super()
            this.filename = filename;
        }
        /**
         * Initializes the storage
         */
        init(): void { 

        }
        /**
         * Appends the headers in datalog
         */
        appendHeaders(headers: string[]): void { 
            const line = headers.join(datalogger.SEPARATOR);
            storage.appendLine(this.filename, `sep=${datalogger.SEPARATOR}`);
            storage.appendLine(this.filename, line);
        }
        /**
         * Appends a row of data
         */
        appendRow(values: number[]): void { 
            const line = values.join(datalogger.SEPARATOR);
            storage.appendLine(this.filename, line);
        }
        /**
         * Flushes any buffered data
         */
        flush(): void { 

        }
    }
}