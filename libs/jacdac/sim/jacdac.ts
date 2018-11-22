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
        methods: ((p: pxsim.RefBuffer) => boolean)[],
        controlData: pxsim.RefBuffer
    ): JacDacDriverStatus {
        return new JacDacDriverStatus(driverType, deviceClass, methods, controlData);
    }

    export class JDDevice {
        buf: pxsim.RefBuffer;
        constructor(buf: pxsim.RefBuffer) {
            this.buf = buf;
        }

        static mk(address: number, flags: number, serialNumber: number, driverClass: number) {
            const buf = BufferMethods.createBuffer(12);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt8LE, 0, address);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt8LE, 1, 0); // rolling counter
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 2, flags);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 4, serialNumber);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 8, driverClass);
            return new JDDevice(buf);
        }

        get driverAddress(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0);
        }
        get rollingCounter(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2);
        }
        get serialNumber(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4);
        }
        get driverClass(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 8);
        }
    }
}

class JacDacDriverStatus {
    device: pxsim.RefBuffer;
    id: number;
    constructor(
        driverType: number,
        deviceClass: number,
        public methods: ((p: pxsim.RefBuffer) => boolean)[],
        public controlData: pxsim.RefBuffer) {
        this.id = pxsim.control.allocateNotifyEvent();
        this.device = pxsim.jacdac.JDDevice.mk(0, driverType, 0, deviceClass).buf;
    }
    isPairedInstanceAddress(address: number): number {
        return 0;
    }
    setBridge(): void {

    }
}
