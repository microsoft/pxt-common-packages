namespace pxsim {
    export interface SimulatorJacDacMessage extends SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        address: number;
        packet: Uint8Array;
    }

    export class JacDacState {
        drivers: jacdac.JDDriver[];
        running = false;
        bridge: jacdac.JDDriver;
        _nextId = jacdac.DAL.DEVICE_ID_JD_DYNAMIC_ID;
        get nextId(): number {
            return ++this._nextId;
        }

        constructor(board: BaseBoard) {
            this.drivers = [new jacdac.JDLogicDriver(this.nextId)]
            board.addMessageListener(msg => this.processMessage(msg));
        }

        start() {
            this.running = true;
        }

        stop() {
            this.running = false;
        }

        addDriver(d: JacDacDriverStatus) {
            this.drivers.push(d);
            this.start();
        }

        sendPacket(packet: pxsim.RefBuffer, address: number): number {
            if (this.running)
                Runtime.postMessage(<SimulatorJacDacMessage>{
                    type: "jacdac",
                    broadcast: true,
                    address: address,
                    packet: packet.data
                })
            return 0;
        }

        processMessage(msg: pxsim.SimulatorMessage) {
            if (!this.running) return;

            if (msg && msg.type == "jacdac") {
                const jdmsg = msg as pxsim.SimulatorJacDacMessage;
                const buf = pxsim.BufferMethods.createBuffer(jdmsg.packet.length);
                for(let i = 0 ; i < buf.data.length; ++i)
                    buf.data[i] = jdmsg.packet[i];
                const pkt = new jacdac.JDPacket(buf);
                this.drivers[0].handleLogicPacket(pkt);
            }
        }

        onPacketReceived(pkt: jacdac.JDPacket) {
            const logic = this.drivers[0] as jacdac.JDLogicDriver;
            if (!logic.filterPacket(pkt.address)) {
                let driver_class = 0;

                for (let i = 0; i < this.drivers.length; i++) {
                    if (this.drivers[i]) {
                        // could be optimised into a single if, but useful for debugging.
                        if ((this.drivers[i].device.flags & jacdac.DAL.JD_DEVICE_FLAGS_INITIALISED) && this.drivers[i].device.address == pkt.address) {
                            if (this.drivers[i].device.flags & jacdac.DAL.JD_DEVICE_FLAGS_BROADCAST_MAP) {
                                driver_class = this.drivers[i].device.driverClass;
                            }
                            else {
                                // DMESG("HANDLED BY LOCAL / REMOTE A: %d", this->drivers[i]->getAddress());
                                this.drivers[i].handlePacket(pkt);
                            }

                            break; // only one address per device, lets break early
                        }
                    }
                }

                // if we've matched a broadcast map, it means we need to map a broadcast packet to any driver of the same class
                if (driver_class > 0)
                    for (let i = 0; i < this.drivers.length; i++) {
                        if ((this.drivers[i].device.flags & jacdac.DAL.JD_DEVICE_FLAGS_BROADCAST) && this.drivers[i].device.driverClass == driver_class) {
                            this.drivers[i].handlePacket(pkt);
                        }
                    }
            }

            if (this.bridge)
                this.bridge.handlePacket(pkt);
        }
    }

    export interface JacDacBoard extends CommonBoard {
        jacdacState: JacDacState;
    }
    export function getJacDacState() {
        return (board() as JacDacBoard).jacdacState;
    }
}