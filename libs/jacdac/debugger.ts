namespace jacdac {
    export class DebugView {
        driverClass: number;
        name: string;

        constructor(name: string, driverClass: number) {
            this.name = name;
            this.driverClass = driverClass;
        }
        renderControlPacket(cp: ControlPacket){
            return "";
        }
        renderPacket(packet: JDPacket) {
            return "";
        }
    }
}