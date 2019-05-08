namespace storage {

        /** 
         * Append a buffer to a new or existing file. 
         * @param filename name of the file, eg: "log.txt"
         */
        //% parts="storage"
        export function appendBuffer(filename: string, data: Buffer): void
        {
            _appendBuffer(filename, data)
        }
    
        /** 
         * Overwrite file with a buffer. 
         * @param filename name of the file, eg: "log.txt"
         */
        //% parts="storage"
        export function overwriteWithBuffer(filename: string, data: Buffer): void
        {
            _overwriteWithBuffer(filename, data)
        }
}