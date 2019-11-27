namespace configStorage {
    /**
     * Stores the value at the key entry
     * @param key identifier of the key (max 16 characters)
     * @param value identifier of the value (max 32 characters)
     */
    export function setItem(key: string, value: string) {
        if (value == null)
            configStorage.removeItem(key);
        else
        {
            let idx = 0;
            let buf = control.createBuffer(value.length + 1);
            buf[idx++] = value.length;
            let valBuf = control.createBufferFromUTF8(value);

            for (let i = 0; i < valBuf.length; i++)
                buf[idx++] = valBuf[i];

            configStorage.setBuffer(key, buf);
        }
    }

    /**
     * Retrieves the value at the key entry
     * @param key identifier of the key (max 16 characters)
     */
    export function getItem(key: string): string {
        const buf = configStorage.getBuffer(key);

        if (!buf)
            return undefined;

        let idx = 0;
        let count = buf[idx++];
        const retBuf = control.createBuffer(count);

        for (let i = 0; i < count; i++)
            retBuf[i] = buf[idx++];

        return retBuf.toString();
    }
}
