namespace pxsim {
    export interface SimulatorJacDacMessage extends SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        packet: Uint8Array;
    }

    export class JacDacState {
        eventId: number;
        board: BaseBoard;
        running = false;
        runtimeId: string;

        constructor(board: BaseBoard) {
            this.eventId = pxsim.jacdac.DAL.DEVICE_ID_JACDAC0;
            this.board = board;
            board.addMessageListener(msg => this.processMessage(msg));
        }

        start() {
            if (this.running) return;

            this.running = true;
            this.runtimeId = runtime.id;
        
            const cb = () => {
                if (!this.running || this.runtimeId != runtime.id) return;
                this.protocol.logic.periodicCallback();
                setTimeout(cb, 50);
            };
            cb();

            const b = board();
            if (b)
                b.bus.queue(this.eventId, pxsim.jacdac.DAL.JD_SERIAL_EVT_BUS_CONNECTED);
        }

        stop() {
            this.running = false;            
            const b = board();
            if (b)
                b.bus.queue(this.eventId, pxsim.jacdac.DAL.JD_SERIAL_EVT_BUS_DISCONNECTED);
        }

        processMessage(msg: pxsim.SimulatorMessage) {
            if (!this.running) return;

            if (msg && msg.type == "jacdac") {
                const jdmsg = msg as pxsim.SimulatorJacDacMessage;
                const buf = pxsim.BufferMethods.createBuffer(jdmsg.packet.length);
                for (let i = 0; i < buf.data.length; ++i)
                    buf.data[i] = jdmsg.packet[i];
                const pkt = new jacdac.JDPacket(buf);
                this.protocol.onPacketReceived(pkt);
            }
        }
    }

    export interface JacDacBoard extends CommonBoard {
        jacdacState: JacDacState;
    }
    export function getJacDacState() {
        return (board() as JacDacBoard).jacdacState;
    }
}