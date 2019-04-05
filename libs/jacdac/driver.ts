namespace jacdac {
    //% fixedInstances
    export class Service extends jacdac.JDService {
        public name: string;
        protected supressLog: boolean;
        private _controlData: Buffer;
        private _eventId: number;

        constructor(name: string, serviceClass: number, mode: JDServiceMode, controlDataLength = 0) {
            super(serviceClass, mode)

            this.name = name;
            this._controlData = control.createBuffer(Math.max(0, controlDataLength));
            this.supressLog = false;
            this._eventId = control.allocateNotifyEvent();
        }

        get eventId() {
            return this._eventId;
        }

        get serviceNumber(): number {
            this.start();
            return this.service_number;
        }

        get deviceAddress(): number {
            const d = this.device();
            return d ? d.device_address : -1;
        }

        get deviceName(): string {
            const d = this.device();
            return d ? d.device_name : "";
        }

        get controlData(): Buffer {
            return this._controlData;
        }

        isStarted(): boolean {
            return jacdac.JACDAC.instance.contains(this);
        }

        public log(text: string) {
            if (!this.supressLog || jacdac.consolePriority < console.minPriority) {
                let dev = jacdac.JACDAC.instance.getDeviceName();
                if (!dev) {
                    const d = this.device;
                    dev = d ? toHex8(d.device_address) : "--";
                }
                console.add(jacdac.consolePriority, `${dev}:${toHex8(this.serviceNumber)}>${this.name}>${text}`);
            }
        }

        protected sendPacket(pkt: Buffer) {
            this.start();
            this.send(pkt);
        }

        /**
         * Registers and starts the driver
         */
        //% blockId=jacdachoststart block="start %service"
        //% group="Services"
        start() {
            if (jacdac.JACDAC.instance.add(this)) {
                this.log("start");
            }
        }

        /**
         * Unregister and stops the driver
         */
        //% blockId=jacdachoststop block="stop %service"
        //% group="Services"
        stop() {
            if (jacdac.JACDAC.instance.remove(this)) {
                this.log("stop")
            }
        }
    }

    //% fixedInstances
    export class Broadcast extends Service {
        constructor(name: string, serviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.BroadcastHostService, serviceClass, controlDataLength);
        }
    }

    //% fixedInstances
    export class Host extends Service {
        constructor(name: string, serviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.HostService, serviceClass, controlDataLength);
        }
    }

    //% fixedInstances
    export class Client extends Service {
        constructor(name: string, serviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.ClientService, serviceClass, controlDataLength);
        }

        protected registerEvent(value: number, handler: () => void) {
            control.onEvent(this.eventId, value, handler);
            this.start();
        }
    }
}