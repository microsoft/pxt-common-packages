namespace pxsim {
    export interface SimulatorJacDacMessage extends SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        address: number;
        packet: Uint8Array;
    }

    export class JacDacState {
        board: BaseBoard;
        drivers: jacdac.JDDriver[];
        logic: jacdac.JDLogicDriver;
        running = false;
        bridge: jacdac.JDDriver;
        _nextId = jacdac.DAL.DEVICE_ID_JD_DYNAMIC_ID;
        runtimeId: string;

        get nextId(): number {
            return ++this._nextId;
        }

        constructor(board: BaseBoard) {
            this.board = board;
            this.drivers = [this.logic = new jacdac.JDLogicDriver(this.nextId)]
            board.addMessageListener(msg => this.processMessage(msg));
        }

        start() {
            if (this.running) return;

            this.running = true;
            this.runtimeId = runtime.id;
            const cb = () => {
                if (!this.running || this.runtimeId != runtime.id) return;
                this.logic.periodicCallback();
                setTimeout(cb, 50);
            };
            cb();
        }

        stop() {
            this.running = false;            
        }

        addDriver(d: jacdac.JDDriver) {
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
                for (let i = 0; i < buf.data.length; ++i)
                    buf.data[i] = jdmsg.packet[i];
                const pkt = new jacdac.JDPacket(buf);
                this.onPacketReceived(pkt);
            }
        }

        onPacketReceived(pkt: jacdac.JDPacket) {
            if (!this.logic.filterPacket(pkt.address)) {
                let driver_class = 0;
                for (const driver of this.drivers) {
                    if (!driver) continue;
                    const flags = driver.device.flags;
                    const address = driver.device.address;
                    const initialized = flags & jacdac.DAL.JD_DEVICE_FLAGS_INITIALISED;
                    if (initialized && address == pkt.address) {
                        if (flags & jacdac.DAL.JD_DEVICE_FLAGS_BROADCAST_MAP) {
                            driver_class = driver.device.driverClass;
                        }
                        else driver.handlePacket(pkt);
                        break; // only one address per device, lets break early
                    }
                }
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