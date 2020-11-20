namespace control.simmessages {
    // these events are raised by JS simulator when messages come in
    export const CONTROL_MESSAGE_EVT_ID = 2999;
    export const CONTROL_MESSAGE_RECEIVED = 1;

    //% shim=pxt::sendMessage
    export declare function send(channel: string, message: Buffer, parentOnly?: boolean) : void;

    //% shim=pxt::peekMessageChannel
    declare function peekMessageChannel(): string;

    //% shim=pxt::readMessageData
    declare function readMessageData(): Buffer;

    let handlers: { [channel: string] : (msg: Buffer) => void}
    function consumeMessages() {
        while(true) {
            // peek channel of next message
            const channel = peekMessageChannel();
            if (!channel) break;
            // read next message
            const msg = readMessageData();
            // send to handler
            const handler = handlers && handlers[channel];
            if (handler)
                handler(msg);
        }
    }

    /**
     * Registers the handler for a message on a given channel
     **/
    export function onReceived(channel: string, handler: (msg: Buffer) => void) {
        if (!channel) return;

        if (!handlers)
            handlers = {};
        handlers[channel] = handler;
        control.onEvent(CONTROL_MESSAGE_EVT_ID, CONTROL_MESSAGE_RECEIVED, consumeMessages);
    }
}