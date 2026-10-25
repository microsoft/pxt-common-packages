
namespace pxsim.pxtcore {
    // general purpose message sending mechanism
    export function sendMessage(channel: string, message: RefBuffer, parentOnly?: boolean) {
        if (!channel) return;

        Runtime.postMessage({
            type: "messagepacket",
            broadcast: !parentOnly,
            channel: channel,
            data: message && message.data
        } as SimulatorControlMessage)
    }

    export function peekMessageChannel(): string {
        const state = getControlMessageState();
        const msg = state && state.peek();
        return msg && msg.channel;
    }

    export function readMessageData(): RefBuffer {
        const state = getControlMessageState();
        const msg = state && state.read();
        return msg && new RefBuffer(msg.data);
    }
}

namespace pxsim {
    // keep in sync with ts
    export const CONTROL_MESSAGE_EVT_ID = 2999;
    export const CONTROL_MESSAGE_RECEIVED = 1;

    export class ControlMessageState {
        messages: SimulatorControlMessage[];
        enabled: boolean;

        constructor(private board: CommonBoard) {
            this.messages = [];
            this.enabled = false;
            this.board.addMessageListener(msg => this.messageHandler(msg));
        }
        private messageHandler(msg: SimulatorMessage) {
            if (msg.type == "messagepacket") {
                let packet = <SimulatorControlMessage>msg;
                this.enqueue(packet);
            }
        }
        enqueue(message: SimulatorControlMessage) {
            this.messages.push(message);
            this.board.bus.queue(CONTROL_MESSAGE_EVT_ID, CONTROL_MESSAGE_RECEIVED);
        }
        peek() {
            return this.messages[0];
        }
        read() {
            return this.messages.shift();
        }
    }


    export interface ControlMessageBoard extends CommonBoard {
        controlMessageState: ControlMessageState;
    }

    export function getControlMessageState() {
        return (board() as ControlMessageBoard).controlMessageState;
    }
}