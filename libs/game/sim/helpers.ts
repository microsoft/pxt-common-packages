
namespace pxsim.helpers {
    interface SimulatorMessageToParent extends SimulatorMessage {
        type: "sim-post-message";
        data: pxt.Map<string | number>;
    }

    interface SimulatorMessageFromParent extends SimulatorMessage {
        type: "parent-post-message";
        data: pxt.Map<string | number>;
    }

    export function __postToParent(data: RefMap) {
        let unpacked: pxt.Map<string | number>;
        if (data) {
            unpacked = {};
            for (const el of data.data) {
                unpacked[el.key] = el.val as string | number;
            }
        }

        const msg: SimulatorMessageToParent = {
            data: unpacked,
            type: "sim-post-message",
        }

        Runtime.postMessage(msg);
    }

    interface MessagePassingBoard extends EventBusBoard {
        messagePassingState: MessagePassingState;
    }

    function getMessagePassingState() {
        const b = board() as EventBusBoard as MessagePassingBoard;
        if (!b.messagePassingState) {
            b.messagePassingState = new MessagePassingState();
        }
        return b.messagePassingState;
    }

    class MessagePassingState {
        protected msgQueue: RefMap[];
        static ID = 49738422;
        static EV_ID = 1;

        constructor() {
            runtime.board.addMessageListener(msg => this.messageHandler(msg));
            this.msgQueue = [];
        }

        messageHandler(msg: SimulatorMessage) {
            if (!isParentMessage(msg) || !msg.data) return;
            const rb = pxsim.pxtrt.mkMap();
            for (const key of Object.keys(msg.data)) {
                pxsim.pxtrt.mapSetByString(rb, key, msg.data[key]);
            }
            this.msgQueue.push(rb);
            (<EventBusBoard>runtime.board).bus.queue(MessagePassingState.ID, MessagePassingState.EV_ID);
        }

        getNextMessage(): RefMap {
            return this.msgQueue.shift();
        }

        onReceived(h: RefAction) {
            pxtcore.registerWithDal(MessagePassingState.ID, MessagePassingState.EV_ID, h);
        }
    }

    export function __onMessageFromParent(h: RefAction) {
        getMessagePassingState().onReceived(h);
    }

    export function __receiveDataFromParent() {
        return getMessagePassingState().getNextMessage();
    }

    function isParentMessage(msg: SimulatorMessage): msg is SimulatorMessageFromParent {
        return msg && msg.type === "parent-post-message";
    }
}