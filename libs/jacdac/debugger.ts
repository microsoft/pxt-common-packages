namespace jacdac {
    export interface DebugView {
        driverClass: number;
        name: string;
        render?: (data: Buffer) => string;
    }
}