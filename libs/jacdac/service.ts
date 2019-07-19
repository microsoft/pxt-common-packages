namespace jacdac{

    export const enum JDServiceMode {
        ClientService = 1,
        HostService = 2,
        BroadcastHostService = 3,
        ControlLayerService = 4
    }

    export const enum JDServiceClass {
        CONTROL = 0,
        CONTROL_RNG = 1,
        CONTROL_CONFIGURATION = 2,
        CONTROL_TEST = 3,

        JOYSTICK = 4,
        MESSAGE_BUS = 5,
        BRIDGE = 6,
        BUTTON = 7,
        ACCELEROMETER = 8,
        CONSOLE = 9
    }

    export class JDService {
        device?: JDDevice;
        private _service_class: number;
        service_number: number;
        private _mode: JDServiceMode;
        status: number;
        service_flags: number;
        requiredDevice?: JDRequiredDevice;

        onConnected?: () => void;
        onDisconnected?: () => void;

        constructor(service_class: number, mode: JDServiceMode) {
            this._service_class = service_class;
            this.service_number = JD_SERVICE_NUMBER_UNITIALISED_VAL;
            this.status = 0;
            this._mode = mode;
            this.service_flags = 0
        }

        get service_class() {
            return this._service_class;
        }

        get mode() {
            return this._mode;
        }

        addAdvertisementData(): Buffer {
            return jacdac.options.createBuffer(0);
        }

        handleServiceInformation(device: JDDevice, serviceInfo: JDServiceInformation): number {
            return DEVICE_OK;
        }

        handlePacket(pkt: JDPacket): number {
            return DEVICE_OK;
        }


        isConnected(): boolean {
            return (this.status & JD_SERVICE_STATUS_FLAGS_INITIALISED) ? true : false;
        }

        send(buffer: Buffer): void {
            if (this.device && JACDAC.instance.bus.isConnected())
                JACDAC.instance.write(buffer, this.service_number, this.device.device_address, this.device);
        }


        _hostConnected(): void {
            jacdac.options.log("Host Connected");
            this.status |= JD_SERVICE_STATUS_FLAGS_INITIALISED;

            if (this.onConnected)
                this.onConnected();
        }

        _hostDisconnected(): void {
            jacdac.options.log("Host disconnected");
            this.status &= ~JD_SERVICE_STATUS_FLAGS_INITIALISED;

            if (this.onDisconnected)
                this.onDisconnected();
        }

    }
}