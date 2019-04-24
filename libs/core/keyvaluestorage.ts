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
            configStorage.setBuffer(key, control.createBufferFromUTF8(value));
    }

    /**
     * Stores the value at the key entry
     * @param key identifier of the key (max 16 characters)
     */
    export function getItem(key: string): string {
        const buf = configStorage.getBuffer(key);
        return buf ? buf.toString() : undefined;
    }
}
