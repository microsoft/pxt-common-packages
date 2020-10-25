
namespace pxsim.helpers {
    interface SimulatorMessageToParent extends SimulatorMessage {
        type: "sim-post-message";
        data: pxt.Map<string | number>;
    }

    interface SimulatorMessageFromParent extends SimulatorMessage {
        type: "parent-post-message";
        data: pxt.Map<string | number>;
    }

    //%
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

    type MessageHandler = (data: RefMap) => void;

    function getMessagePassingState() {
        const b = board() as EventBusBoard as MessagePassingBoard;
        if (!b.messagePassingState) {
            b.messagePassingState = new MessagePassingState();
        }
        return b.messagePassingState;
    }

    class MessagePassingState {
        public lastMsg: RefMap;
        static ID = 49738422;
        static EV_ID = 1;

        constructor() {
            runtime.board.addMessageListener(msg => this.messageHandler(msg));
        }

        messageHandler(msg: SimulatorMessage) {
            if (!isParentMessage(msg))
            return;
            const rb = pxsim.pxtrt.mkMap();
            if (msg.data) {
                for (const key of Object.keys(msg.data)) {
                    pxsim.pxtrt.mapSetByString(rb, key, msg.data[key]);
                }
            }
            this.lastMsg = rb;
            (<EventBusBoard>runtime.board).bus.queue(MessagePassingState.ID, MessagePassingState.EV_ID);
        }

        onReceived(h: RefAction) {
            pxtcore.registerWithDal(MessagePassingState.ID, MessagePassingState.EV_ID, h);
        }
    }

    export function __onMessageFromParent(h: RefAction) {
        getMessagePassingState().onReceived(h);
    }

    export function __receiveDataFromParent() {
        return getMessagePassingState().lastMsg;
    }

    function isParentMessage(msg: SimulatorMessage): msg is SimulatorMessageFromParent {
        return msg && msg.type === "parent-post-message";
    }
}