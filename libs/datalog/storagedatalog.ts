namespace datalog {
    const FILENAME = "datalog.csv";
    /**
        * A storage for datalog data
    */
    export class StorageDatalogStorage extends DatalogStorage {
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
            const line = headers.join(datalog.SEPARATOR);
            storage.appendLine(this.filename, `sep=${datalog.SEPARATOR}`);
            storage.appendLine(this.filename, line);
        }
        /**
         * Appends a row of data
         */
        appendRow(values: number[]): void { 
            const line = values.join(datalog.SEPARATOR);
            storage.appendLine(this.filename, line);
        }
        /**
         * Flushes any buffered data
         */
        flush(): void { 

        }
    }
}