namespace jacdac {
    //% fixedInstances
    export class Service {
        public name: string;
        protected service: jacdac.JDService;
        protected supressLog: boolean;
        private _controlData: Buffer;

        constructor(name: string, serviceClass: number, mode: JDServiceMode, controlDataLength = 0) {
            this.name = name;
            this.service = new jacdac.JDService(serviceClass, mode);
            this._controlData = control.createBuffer(Math.max(0, controlDataLength));
            this.supressLog = false;
            this.service.onHandlePacket = pkt => this.handlePacket(pkt);
        }

        get serviceNumber(): number {
            this.start();
            return this.service.service_number;
        }

        get deviceName(): string {
            const d = this.service.device();
            return d ? d.device_name : "";
        }

        /**
         * Update the controlData buffer
         */
        protected updateControlPacket() {
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
                let dev = jacdac.JACDAC.instance.deviceName();
                if (!dev) {
                    const d = this.service.device;
                    dev = d ? toHex8(d.device_address) : "--";
                }
                console.add(jacdac.consolePriority, `${dev}:${toHex8(this.serviceNumber)}>${this.name}>${text}`);
            }
        }

        /**
         * Registers code to run a on a particular event
         * @param event 
         * @param handler 
         */
        public onDriverEvent(event: JDDriverEvent, handler: () => void) {
            this.start();
            control.onEvent(this.service.id, event, handler);
        }

        /**
         * Called by the logic driver when a data packet is addressed to this driver
         * Return false when the packet wasn't handled here.
         */
        public handlePacket(pkt: JDPacket): boolean {
            return false
        }

        /**
         * Called by the logic driver when a control packet is received
         * @param pkt 
         */
        public handleControlPacket(pkt: Buffer): boolean {
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
                if (this._controlData.length)
                    control.onEvent(this.service.id, JD_DRIVER_EVT_FILL_CONTROL_PACKET, () => this.updateControlPacket());
            }
        }

        stop() {
            if (jacdac.JACDAC.instance.remove(this.service)) {
                this.log("stop")
                control.onEvent(this.service.id, JD_DRIVER_EVT_FILL_CONTROL_PACKET, () => { });
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

            TODO
            control.onEvent(this.id, value, handler);
            this.start();
        }
    }
}