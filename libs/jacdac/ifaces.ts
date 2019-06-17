namespace jacdac{

    export interface JDOptions {
        utf8Encode: (s: string) => Buffer;
        utf8Decode: (b: Buffer) => string;
        createBuffer: (size: number) => Buffer;
        error: (message: string) => void;
        log: (message: string) => void;
        getSerialNumber: () => Buffer;
    }

    export interface JDPhysicalLayer {
        writeBuffer(buf: Buffer): void;
        isConnected(): boolean;
    }

    export interface JDSerializable {
        getBuffer(): Buffer;
    }
}