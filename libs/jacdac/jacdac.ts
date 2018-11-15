class JacDacDriver {
    public device: JacDacDriverStatus;
    public driverType: jacdac.DriverType;
    public deviceClass: number;
    public logPriority: ConsolePriority;

    constructor(driverType: jacdac.DriverType, deviceClass: number) {
        this.driverType = driverType;
        this.deviceClass = deviceClass || jacdac.programHash();
        this.logPriority = ConsolePriority.Silent;
    }

    protected log(text: string) {
        console.add(this.logPriority, text);
    }

    /**
     * Called by the logic driver when a control packet is addressed to this driver.
     * Return false when the packet wasn't handled here.
     */
    public handleControlPacket(pkt: Buffer): boolean {
        return false
    }

    /**
     * Called by the logic driver when a data packet is addressed to this driver
     * Return false when the packet wasn't handled here.
     */
    public handlePacket(pkt: Buffer): boolean {
        return false
    }

    /**
     * Fill additional driver-specific info on the control packet for this driver.
     **/
    public fillControlPacket(pkt: Buffer): void { }

    /**
     * Called by the logic driver when a new device is connected to the serial bus
     */
    public deviceConnected(): void {
    }

    /**
     * Called by the logic driver when an existing device is disconnected from the serial bus
     **/
    public deviceRemoved(): void {
    }

    /**
     * Sends a pairing packet
     */
    public sendPairing(address: number, flags: number, serialNumber: number, driverClass: number) { }
}

/**
 * JACDAC protocol support
 */
namespace jacdac {
    // This enumeration specifies that supported configurations that drivers should utilise.
    // Many combinations of flags are supported, but only the ones listed here have been fully implemented.
    export enum DriverType {
        VirtualDriver = DAL.JD_DEVICE_FLAGS_REMOTE, // the driver is seeking the use of another device's resource
        PairedDriver = DAL.JD_DEVICE_FLAGS_BROADCAST | DAL.JD_DEVICE_FLAGS_PAIR,
        HostDriver = DAL.JD_DEVICE_FLAGS_LOCAL, // the driver is hosting a resource for others to use.
        PairableHostDriver = DAL.JD_DEVICE_FLAGS_PAIRABLE | DAL.JD_DEVICE_FLAGS_LOCAL, // the driver is allowed to pair with another driver of the same class
        BroadcastDriver = DAL.JD_DEVICE_FLAGS_LOCAL | DAL.JD_DEVICE_FLAGS_BROADCAST, // the driver is enumerated with its own address, and receives all packets of the same class (including control packets)
        SnifferDriver = DAL.JD_DEVICE_FLAGS_REMOTE | DAL.JD_DEVICE_FLAGS_BROADCAST, // the driver is not enumerated, and receives all packets of the same class (including control packets)
    };

    /**
     * base class for pairable drivers
    */
    export class JacDacPairableDriver extends JacDacDriver {
        constructor(isHost: boolean, deviceClass: number) {
            super(isHost ? DriverType.PairableHostDriver : DriverType.PairedDriver,
                deviceClass);
        }

        protected sendPacket(pkt: Buffer) {
            jacdac.sendPacket(pkt, this.device.driverAddress);
        }

        protected canSendHostPacket(): boolean {
            return this.device.isPaired && this.device.isConnected;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            if (this.device.isPairedDriver && !this.device.isPaired) {
                this.log("pairing");
                if (cp.flags & DAL.CONTROL_JD_FLAGS_PAIRABLE) {
                    jacdac.sendPairing(cp.address,
                        DAL.JD_DEVICE_FLAGS_REMOTE
                        | DAL.JD_DEVICE_FLAGS_INITIALISED
                        | DAL.JD_DEVICE_FLAGS_CP_SEEN,
                        cp.serialNumber,
                        cp.driverClass);
                }
            }
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if (!this.device.isConnected || !this.device.isPaired || !this.device.isPairedInstanceAddress(packet.address))
                return true;

            if (this.device.isPairedDriver)
                return this.handleHostPacket(packet);
            else
                return this.handleVirtualPacket(packet);
        }

        /**
         * Processes the packet received by the host
         * @param packet 
         */
        protected handleHostPacket(packet: JDPacket): boolean {
            return true;
        }

        /**
         * Processes the packet received by the virtual driver
         * @param packet 
         */
        protected handleVirtualPacket(packet: JDPacket): boolean {
            return true;
        }
    }

    export enum JacDacStreamingState {
        Stopped,
        Streaming,
        Stopping
    }

    export enum JacDacStreamingCommand {
        None,
        StartStream,
        StopStream,
        State
    }

    export class JacDacStreamingPairableDriver extends JacDacPairableDriver {
        private _streamingState: JacDacStreamingState;
        public streamingInterval: number; // millis
        public time: number;
        public state: Buffer;

        constructor(isHost: boolean, deviceClass: number) {
            super(isHost, deviceClass);
            this._streamingState = JacDacStreamingState.Stopped;
            this.streamingInterval = 20;
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            switch (command) {
                case JacDacStreamingCommand.StartStream:
                    const interval = packet.getNumber(NumberFormat.UInt32LE, 1);
                    this.startStreaming(interval);
                    return true;
                case JacDacStreamingCommand.StopStream:
                    this.stopStreaming();
                    return true;
                default:
                    // let the user deal with it
                    return this.handleHostCommand(command, packet);
            }
        }

        protected handleVirtualPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            switch (command) {
                case JacDacStreamingCommand.State:
                    const time = packet.getNumber(NumberFormat.UInt32LE, 1);
                    const state = packet.data.slice(5);
                    const r = this.handleVirtualState(time, state);
                    this.time = time;
                    this.state = state;
                    return r;
                default:
                    return this.handleVirtualCommand(command, packet);
            }
            return true;
        }        

        // override
        protected handleHostCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(time: number, state: Buffer) {
            return true;
        }

        protected serializeState(): Buffer {
            return undefined;
        }

        protected startStreaming(interval: number = -1) {
            if (this._streamingState != JacDacStreamingState.Stopped
                || !this.device.isPairedDriver) return;

            this._streamingState = JacDacStreamingState.Streaming;
            if (interval > 0)
                this.streamingInterval = interval;
            control.runInBackground(() => {
                while (this._streamingState == JacDacStreamingState.Streaming) {
                    // run callback                    
                    const state = this.serializeState();
                    if (!!state) {
                        const pkt = control.createBuffer(state.length + 4);
                        pkt.setNumber(NumberFormat.UInt8LE, 0, JacDacStreamingCommand.State);
                        pkt.setNumber(NumberFormat.UInt32LE, 1, control.millis());
                        pkt.write(5, state);
                        this.sendPacket(pkt);
                    }
                    // check streaming interval value
                    if (this.streamingInterval < 0)
                        break;
                    // waiting for a bit
                    pause(this.streamingInterval);
                }
                this._streamingState = JacDacStreamingState.Stopped;
            })
        }

        protected stopStreaming() {
            this._streamingState = JacDacStreamingState.Stopping;
            pauseUntil(() => this._streamingState == JacDacStreamingState.Stopped);
        }
    }

    //% shim=pxt::programHash
    export function programHash(): number { return 0 }

    //% shim=jacdac::__internalSendPairingPacket
    function __internalSendPairingPacket(address: uint32, flags: uint32, serialNumber: uint32, driverClass: uint32): void {
    }

    /**
     * Sends a pairing packet
     * @param address 
     * @param flags 
     * @param serialNumber 
     * @param driverClass 
     */
    //%
    export function sendPairing(address: uint32, flags: uint32, serialNumber: uint32, driverClass: uint32): void {
        __internalSendPairingPacket(address, flags, serialNumber, driverClass);
    }


    //% shim=jacdac::__internalAddDriver
    function __internalAddDriver(driverType: number, deviceClass: number, methods: ((p: Buffer) => void)[]): JacDacDriverStatus {
        return null
    }

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: JacDacDriver) {
        if (n.device) { // don't add twice
            control.dmesg(`jd> driver already added ${n.driverType} ${n.deviceClass}`)
            return;
        }
        control.dmesg(`jd> driver ${n.driverType} ${n.deviceClass}`)
        n.device = __internalAddDriver(n.driverType, n.deviceClass, [
            (p: Buffer) => n.handleControlPacket(p),
            (p: Buffer) => n.handlePacket(p),
            (p: Buffer) => n.fillControlPacket(p),
            () => n.deviceConnected(),
            () => n.deviceRemoved()])
    }

    /**
     * Sends a packet
     * @param pkt jackdack data
     */
    export function sendPacket(pkt: Buffer, deviceAddress: number) {
        control.dmesg(`jd> send pkt to ${deviceAddress}`)
        __internalSendPacket(pkt, deviceAddress);
    }

    export class JDPacket {
        protected buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        get crc(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 0);
        }
        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 2);
        }
        get size(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 3);
        }
        get data(): Buffer {
            return this.buf.slice(4);
        }

        getNumber(format: NumberFormat, offset: number) {
            return this.buf.getNumber(format, offset + 4);
        }

        setNumber(format: NumberFormat, offset: number, value: number) {
            this.buf.setNumber(format, offset + 4, value);
        }
    }

    export class ControlPacket {
        private buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        get packetType(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 0);
        }
        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 2);
        }
        get driverClass(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        get serialNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 8);
        }
        get data(): Buffer {
            return this.buf.slice(12);
        }
    }
}