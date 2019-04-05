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
        private packetQueue: Uint8Array[];

        constructor(board: BaseBoard) {
            this.eventId = 100; // ?
            this.board = board;
            this.packetQueue = [];
            board.addMessageListener(msg => this.processMessage(msg));
        }

        start() {
            this.running = true;
        }

        stop() {
            this.running = false;
        }

        isConnected() {
            return this.running;
        }

        isRunning() {
            return this.running;
        }

        getState(): number {
            return 0;
        }

        getPacket(): RefBuffer {
            const b = this.packetQueue.shift();
            if (!b) return undefined;
            const buf = pxsim.BufferMethods.createBuffer(b.length);
            for (let i = 0; i < buf.data.length; ++i)
                buf.data[i] = b[i];
            return buf;
        }

        sendPacket(buf: RefBuffer) {
            Runtime.postMessage(<SimulatorJacDacMessage>{
                type: "jacdac",
                broadcast: true,
                packet: BufferMethods.getBytes(buf)
            })
        }

        processMessage(msg: pxsim.SimulatorMessage) {
            const b = board();
            if (!this.running || !b) return;

            if (msg && msg.type == "jacdac") {
                const jdmsg = msg as pxsim.SimulatorJacDacMessage;
                this.packetQueue.push(jdmsg.packet);
                b.bus.queue(this.eventId, DAL.JD_SERIAL_EVT_DATA_READY);
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

namespace pxsim.jacdac {
    /**
     * Gets the physical layer component id
     **/
    export function __physId(): number {
        const state = getJacDacState();
        return state ? state.eventId : -1;
    }

    /**
     * Write a buffer to the jacdac physical layer.
     **/
    export function __physSendPacket(buf: RefBuffer): void {
        const state = getJacDacState();
        if (state)
            state.sendPacket(buf);
    }

    /**
     * Reads a packet from the queue. NULL if queue is empty
     **/
    export function __physGetPacket(): RefBuffer {
        const state = getJacDacState();
        return state ? state.getPacket() : undefined;
    }

    /**
     * Returns the connection state of the JACDAC physical layer.
     **/
    export function __physIsConnected(): boolean {
        const state = getJacDacState();
        return state && state.isConnected();
    }

    /**
     * Indicates if the bus is running
     **/
    export function __physIsRunning(): boolean {
        const state = getJacDacState();
        return state && state.isRunning();
    }

    /**
     * Starts the JACDAC physical layer.
     **/
    export function __physStart(): void {
        const state = getJacDacState();
        if (state)
            state.start();
    }

    /**
     * Stops the JACDAC physical layer.
     **/
    export function __physStop(): void {
        const state = getJacDacState();
        if (state)
            state.stop();
    }

    /**
     * Gets the bus state
     */
    export function __physState(): number {
        const state = getJacDacState();
        return state ? state.getState() : 0;
    }
}