namespace pxsim.jacdac {
    export function start() {
        // TODO
    }

    export function stop() {
        // TODO
    }

    export function __internalSendPacket(packet: RefBuffer, address: number): number {
        /* TODOs
        pxsim.Runtime.postMessage(<pxsim.SimulatorJacDacPacketMessage>{ 
            type: "jacdac",
            packetType: "pkt",
            packet: packet.data,
            address
        });
        */
        return 0;
    }

    export function __internalAddDriver(
        driverType: number,
        deviceClass: number,
        methods: ((p: RefBuffer) => void)[]):
        JacDacDriverStatus {
        // TODO keep track        
        return new JacDacDriverStatus(driverType, deviceClass, methods);
    }
}

export class JacDacDriverStatus {
    constructor(private driverType: number, private deviceClass: number, private methods: ((p: Buffer) => void)[]) {
        this.serialNumber = Math.random();
        this.id = pxsim.board().bus.allocateNotifyEvent();
        this.isPaired = false;
        this.isPairable = false; // TODO
        this.isVirtualDriver = false; // TODO
        this.isConnected = false; // TODO
        this.isPairedDriver = false; // TODO
    }
    /**
     * Retrieves the serial number in use by this driver.
     *
     * @return the serial number
     **/
    //% property shim=JacDacDriverStatusMethods::serialNumber
    serialNumber: number;

    /** Check if device is paired. */
    //% property shim=JacDacDriverStatusMethods::isPaired
    isPaired: boolean;

    /** Check if device is pairable. */
    //% property shim=JacDacDriverStatusMethods::isPairable
    isPairable: boolean;

    /** Check if driver is virtual. */
    //% property shim=JacDacDriverStatusMethods::isVirtualDriver
    isVirtualDriver: boolean;

    /** Check if driver is paired. */
    //% property shim=JacDacDriverStatusMethods::isPairedDriver
    isPairedDriver: boolean;

    /** Check if driver is connected. */
    //% property shim=JacDacDriverStatusMethods::isConnected
    isConnected: boolean;

    /** Get device class. */
    //% property shim=JacDacDriverStatusMethods::driverClass
    driverClass: uint32;

    /** Get device class. */
    //% property shim=JacDacDriverStatusMethods::driverAddress
    driverAddress: uint8;

    /** Get device id for events. */
    //% property shim=JacDacDriverStatusMethods::id
    id: boolean;

    /** If paired, paired instance address */
    //% property shim=JacDacDriverStatusMethods::isPairedInstanceAddress
    isPairedInstanceAddress(address: number): number {
        return 0;
    }
}
