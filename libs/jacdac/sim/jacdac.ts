namespace pxsim.jacdac {
    export function start() {
        // TODO
    }

    export function stop() {
        // TODO
    }

    export function __internalSendPacket(packet: pxsim.RefBuffer, address: number): number {
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
        methods: ((p: pxsim.RefBuffer) => void)[]):
        JacDacDriverStatus {
        // TODO keep track        
        return new JacDacDriverStatus(driverType, deviceClass, methods);
    }
}

class JacDacDriverStatus {
    constructor(private driverType: number, private deviceClass: number, private methods: ((p: pxsim.RefBuffer) => void)[]) {
        this.id = pxsim.control.allocateNotifyEvent();
    }

    /** Get device id for events. */
    //% property shim=JacDacDriverStatusMethods::id
    id: number;

    /** If paired, paired instance address */
    //% property shim=JacDacDriverStatusMethods::isPairedInstanceAddress
    isPairedInstanceAddress(address: number): number {
        return 0;
    }
}
