namespace control.messages {
    // these events are raised by C++/JS when messages come in
    export const CONTROL_MESSAGE_EVT_ID = 2999;
    export const CONTROL_MESSAGE_RECEIVED = 1;

    //% shim=pxt::sendMessage
    export function send(channel: string, message: Buffer) {
        // leave empty: this function is implemented in the simulator
    }

    //% shim=pxt::peekMessageChannel
    function peekChannel(): string {
        // leave empty: this function is implemented in the simulator
        return null;
    }
    
    //% shim=pxt::readMessageData
    function readMessage(): Buffer {
        // leave empty: this function is implemented in the simulator
        return null;
    }

    let handlers: { [channel: string] : (msg: Buffer) => void}
    function consumeMessages() {
        while(true) {
            // peek channel of next message
            const channel = peekChannel();
            if (!channel) break;
            // read next message
            const msg = readMessage();
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