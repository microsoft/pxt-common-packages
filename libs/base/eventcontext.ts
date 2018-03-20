namespace control {
    /**
     * Run code when a registered event happens.
     * @param id the event compoent id
     * @param value the event value to match
     */
    //% weight=20 blockGap=8 blockId="control_on_event" block="on event|from %src|with value %value"
    //% blockExternalInputs=1
    //% help="control/on-event"          
    export function onEvent(src: number, value: number, handler: () => void, flags = 16) { // EVENT_LISTENER_DEFAULT_FLAGS
        const ctx = control.eventContext();
        if (!ctx)
            control.internalOnEvent(src, value, handler, flags);
        else
            ctx.registerHandler(src, value, handler, flags);
    }

    class EventHandler {
        src: number;
        value: number;
        handler: () => void;
        flags: number;

        constructor(src: number, value: number, handler: () => void, flags: number) {
            this.src = src;
            this.value = value;
            this.handler = handler;
        }

        register() {
            control.internalOnEvent(this.src, this.value, () => {
                if (this.handler) this.handler();
            }, this.flags)
        }

        unregister() {
            control.internalOnEvent(this.src, this.value, doNothing, this.flags);
        }
    }

    function doNothing() { }

    class EventContext {
        handlers: EventHandler[];
        constructor() {
            this.handlers = [];
        }

        register() {
            for (const h of this.handlers)
                h.register();
        }

        unregister() {
            for (const h of this.handlers)
                h.unregister();
        }

        registerHandler(src: number, value: number, handler: () => void, flags: number) {
            // already there?
            for (const h of this.handlers) {
                if (h.src == src && h.value == value) {
                    h.flags = flags;
                    h.handler = handler;
                    return;
                }
            }
            // register and push
            const hn = new EventHandler(src, value, handler, flags);
            this.handlers.push(hn);
            hn.register();
        }
    }

    let eventContexts: EventContext[];

    /**
     * Gets the current event context if any
     */
    export function eventContext(): EventContext {
        return eventContexts ? eventContexts[0] : undefined;
    }

    /**
     * Pushes a new event context and clears all handlers
     */
    export function pushEventContext() {
        if (!eventContexts)
            eventContexts = [];

        // unregister previous context
        const ctx = eventContext();
        if(ctx) ctx.unregister();
        // register again
        eventContexts.push(new EventContext());
    }

    /**
     * Pops the current event context and restore handlers if any previous context
     */
    export function popEventContext() {
        if (!eventContexts) return;

        // clear current context
        const ctx = eventContexts.pop();
        if (!ctx) return;
        ctx.unregister();

        // register old context again
        const context = eventContexts[eventContexts.length - 1];
        if (context)
            context.register();
        else
            eventContexts = undefined;
    }
}