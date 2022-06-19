namespace crypto {
    /**
     * Compute cryptographic SHA256 hash of the concatenation of buffers. Returns 32-byte buffer.
     */
    //% promise shim=crypto::_sha256
    export declare function sha256(buffers: Buffer[]): Buffer;


    /**
     * Compute keyed-Hash Message Authentication Code as defined in RFC 2104.
     */
    export function sha256Hmac(key: Buffer, msg: Buffer) {
        const blockSize = 64
        if (key.length > blockSize) key = sha256([key])
        const paddedKey = Buffer.create(blockSize)
        paddedKey.write(0, key)
        for (let i = 0; i < blockSize; ++i) paddedKey[i] ^= 0x36
        const h0 = sha256([paddedKey, msg])
        for (let i = 0; i < blockSize; ++i) paddedKey[i] ^= (0x36 ^ 0x5c)
        return sha256([paddedKey, h0])
    }

} // namespace crypto