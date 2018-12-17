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
        renderPacket(device: JDDevice, packet: JDPacket) {
            return "";
        }

        static factories: DebugViewFactory[] = [
            () => [ConsoleDriver.debugView(), MessageBusService.debugView()]
        ];
    }

    type DebugViewFactory = () => DebugView[];
}