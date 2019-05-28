/// <reference path="ifaces.ts"/>

namespace jacdac {
    class JDDummyBus implements JDPhysicalLayer {
        writeBuffer(buf: Buffer) {
        }

        isConnected() {
            return true;
        }
    }

    /**
     * A packet
     */
    export class JACDAC {
        private static _instance: JACDAC;
        private _controlService: JDControlService;
        private _consoleService: JDConsoleService;
        private _bridge: JDService;
        private _services: JDService[];
        private _bus: JDPhysicalLayer;

        private state: boolean;

        onIdentificationRequest: () => void;
        onNameRemotelyChanged: (name: string) => void;

        get bus() {
            return this._bus;
        }

        set bus(bus: JDPhysicalLayer) {
            this._bus = bus;
        }

        get services(): JDService[] {
            return this._services.slice(0);
        }

        get bridge() {
            return this._bridge;
        }

        set bridge(bridge: JDService) {
            this._bridge = bridge;
        }

        get devices(): JDDevice[] {
            return this._controlService.deviceManager.getDeviceList();
        }

        get controlService() {
            return this._controlService;
        }

        get consoleService() {
            if (!this._consoleService) {
                this._consoleService = new JDConsoleService();
                this.add(this._consoleService);
            }
            return this._consoleService;
        }

        private constructor() {
            this._bus = new JDDummyBus();
            this._services = [];
            this._controlService = new JDControlService();
        }

        //packet received instead?
        routePacket(pkt: JDPacket): void {
            this._controlService.routePacket(pkt);

            // if we have a bridge service, route all packets to it.
            if (this._bridge)
                this._bridge.handlePacket(pkt);
        }

        start(): void {
            if (this.state)
                return;

            this.state = true;
            this._controlService.enumerate();
        }

        stop(): void {
            if (!this.state)
                return;

            this.state = false;
            this._controlService.disconnect();
        }

        setDeviceName(name: string): void {
            this._controlService.setDeviceName(name);
        }

        getDeviceName(): string {
            return this._controlService.getDeviceName();
        }

        triggerRemoteIdentification(device_address: number): void {
            this._controlService.configurationService.triggerRemoteIdentification(device_address);
        }

        setRemoteDeviceName(device_address: number, name: string): void {
            this._controlService.configurationService.setRemoteDeviceName(device_address, name);
        }

        getRemoteDevice(device_address: number): JDDevice {
            return this._controlService.getRemoteDevice(device_address);
        }

        isRunning(): boolean {
            return this.state
        }

        add(service: JDService): boolean {

            for (let s of this._services)
                if (s == service)
                    return false;

            this._services.push(service);
            jacdac.options.log(`added service cls:${service.service_class}, md:${service.mode} (${this._services.length} services)`);

            // only enumerate if a new host service is added. Enumerate is idempotent.
            if (service.mode == JDServiceMode.HostService || service.mode == JDServiceMode.BroadcastHostService)
                this._controlService.enumerate();

            return true;
        }

        remove(service: JDService): boolean {
            for (let i = 0; i < this._services.length; ++i) {
                if (this._services[i] == service) {
                    jacdac.options.log(`removing service ${service.service_class}`);
                    const isHost = (service.mode == JDServiceMode.HostService || service.mode == JDServiceMode.BroadcastHostService);
                    if (isHost)
                        this._controlService.disconnect();
                    this._services.splice(i, 1);
                    if (isHost)
                        this._controlService.enumerate();
                    return true;
                }
            }

            return false;
        }

        contains(service: JDService): boolean {
            for (let i = 0; i < this._services.length; ++i) {
                if (this._services[i] == service)
                    return true;
            }
            return false;
        }

        public static get instance() {
            return this._instance || (this._instance = new JACDAC());
        }

        write(buf: Buffer, service_number: number, device_address: number, device: JDDevice) {
            let packet = new JDPacket();
            packet.data = buf

            packet.device_address = device_address;
            packet.service_number = service_number;
            packet.communication_rate = JD_DEVICE_DEFAULT_COMMUNICATION_RATE;

            if (device)
                packet.communication_rate = device.communication_rate;

            packet.crc = jd_crc(packet, device);


            this.writePacket(packet);
        }

        writePacket(pkt: JDPacket) {
            this._bus.writeBuffer(pkt.getBuffer());
        }
    }

    /**
     * Gets the JACDAC instance
     */
    export function instance() {
        return jacdac.JACDAC.instance;
    }

    /**
     * Gets a snapshot of the device list
     */
    export function devices(): JDDevice[] {
        return jacdac.JACDAC.instance.devices;
    }

    /**
     * Gets a value that indicates if the JACDAC bus is connected.
     */
    export function isConnected(): boolean {
        return jacdac.JACDAC.instance.bus.isConnected()
            && jacdac.JACDAC.instance.controlService.isConnected();
    }

    /**
     * Gets a value that indicates if JACDAC is running.
     */
    export function isRunning(): boolean {
        return jacdac.JACDAC.instance.isRunning();
    }

    /**
     * Starts and returns the console service
     */
    export function consoleService(): JDConsoleService {
        return jacdac.JACDAC.instance.consoleService;
    }
}
