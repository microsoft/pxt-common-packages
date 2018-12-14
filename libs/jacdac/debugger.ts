namespace jacdac {
    export interface DebugView {
        driverClass: number;
        name: string;
        render?: (packet: JDPacket) => string;
    }
}