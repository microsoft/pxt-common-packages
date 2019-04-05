namespace jacdac {
    //% fixedInstances
    export class Service {
        public name: string;
        protected service: jacdac.JDService;
        protected supressLog: boolean;
        private _controlData: Buffer;
        private _eventId: number;

        constructor(name: string, serviceClass: number, mode: JDServiceMode, controlDataLength = 0) {
            this.name = name;
            this.service = new jacdac.JDService(serviceClass, mode);
            this._controlData = control.createBuffer(Math.max(0, controlDataLength));
            this.supressLog = false;
            this._eventId = control.allocateNotifyEvent();
            this.service.onHandlePacket = pkt => this.handlePacket(pkt);
        }

        get eventId() {
            return this._eventId;
        }

        get serviceNumber(): number {
            this.start();
            return this.service.service_number;
        }

        get deviceAddress(): number {
            const d = this.service.device();
            return d ? d.device_address : -1;
        }

        get deviceName(): string {
            const d = this.service.device();
            return d ? d.device_name : "";
        }

        get controlData(): Buffer {
            return this._controlData;
        }

        get isStarted(): boolean {
            return jacdac.JACDAC.instance.contains(this.service);
        }

        get isConnected(): boolean {
            return this.service.isConnected();
        }

        public log(text: string) {
            if (!this.supressLog || jacdac.consolePriority < console.minPriority) {
                let dev = jacdac.JACDAC.instance.getDeviceName();
                if (!dev) {
                    const d = this.service.device;
                    dev = d ? toHex8(d.device_address) : "--";
                }
                console.add(jacdac.consolePriority, `${dev}:${toHex8(this.serviceNumber)}>${this.name}>${text}`);
            }
        }

        /**
         * Called by the logic driver when a data packet is addressed to this driver
         * Return false when the packet wasn't handled here.
         */
        public handlePacket(packet: JDPacket): boolean {
            return false
        }

        /**
         * Called by the logic driver when a control packet is received
         * @param pkt 
         */
        public handleControlPacket(packet: JDControlPacket): boolean {
            return false;
        }

        protected sendPacket(pkt: Buffer) {
            this.start();
            this.service.send(pkt);
        }

        /**
         * Register and starts the driver
         */
        //% blockId=jacdachoststart block="start %service"
        //% group="Services"
        start() {
            if (jacdac.JACDAC.instance.add(this.service)) {
                this.log("start");
            }
        }

        stop() {
            if (jacdac.JACDAC.instance.remove(this.service)) {
                this.log("stop")
            }
        }
    }

    //% fixedInstances
    export class Broadcast extends Service {
        constructor(name: string, deviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.BroadcastHostService, deviceClass, controlDataLength);
        }
    }

    //% fixedInstances
    export class Host extends Service {
        constructor(name: string, deviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.HostService, deviceClass, controlDataLength);
        }
    }

    //% fixedInstances
    export class Client extends Service {
        constructor(name: string, deviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.ClientService, deviceClass, controlDataLength);
        }

        protected registerEvent(value: number, handler: () => void) {
            control.onEvent(this.eventId, value, handler);
            this.start();
        }
    }
}