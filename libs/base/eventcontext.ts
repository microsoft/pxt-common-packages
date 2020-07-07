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

    export class FrameCallback {
        order: number
        handler: () => void
    }

    class EventHandler {
        constructor(
            public src: number,
            public value: number,
            public handler: () => void,
            public flags: number
        ) { }

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



    export class EventContext {
        private handlers: EventHandler[];
        private frameCallbacks: FrameCallback[];
        private frameWorker: number;
        private framesInSample: number;
        private timeInSample: number;
        public deltaTimeMillis: number;
        private prevTimeMillis: number;
        private idleCallbacks: (() => void)[];

        static lastStats: string;
        static onStats: (stats: string) => void;

        constructor() {
            this.handlers = [];
            this.framesInSample = 0;
            this.timeInSample = 0;
            this.deltaTimeMillis = 0;
            this.frameWorker = 0;
            this.idleCallbacks = undefined;
        }

        get deltaTime() {
            return this.deltaTimeMillis / 1000;
        }

        private runCallbacks() {
            control.enablePerfCounter("all frame callbacks")

            let loopStart = control.millis()
            this.deltaTimeMillis = loopStart - this.prevTimeMillis;
            this.prevTimeMillis = loopStart;
            for (let f of this.frameCallbacks) {
                f.handler()
            }
            let runtime = control.millis() - loopStart
            this.timeInSample += runtime
            this.framesInSample++
            if (this.timeInSample > 1000 || this.framesInSample > 30) {
                const fps = this.framesInSample / (this.timeInSample / 1000);
                EventContext.lastStats = `fps:${Math.round(fps)}`;
                if (fps < 99)
                    EventContext.lastStats += "." + (Math.round(fps * 10) % 10)
                if (control.ramSize() > 2000000 && control.profilingEnabled()) {
                    control.dmesg(`${(fps * 100) | 0}/100 fps - ${this.framesInSample} frames`)
                    control.gc()
                    control.dmesgPerfCounters()
                }
                this.timeInSample = 0
                this.framesInSample = 0
            }
            let delay = Math.max(1, 20 - runtime)

            return delay
        }

        private runningCallbacks: boolean;
        private registerFrameCallbacks() {
            if (!this.frameCallbacks) return;

            const worker = this.frameWorker;
            control.runInParallel(() => {
                if (this.runningCallbacks) {
                    // this context is still running in a different fiber;
                    // delay until the other fiber doing so has ceased.
                    pauseUntil(() => !this.runningCallbacks);
                }
                this.runningCallbacks = true;

                this.framesInSample = 0;
                this.timeInSample = 0;
                this.deltaTimeMillis = 0;
                this.prevTimeMillis = control.millis();

                while (worker == this.frameWorker) {
                    let delay = this.runCallbacks()
                    pause(delay)
                }

                this.runningCallbacks = false;
            })
        }

        register() {
            for (const h of this.handlers)
                h.register();
            this.registerFrameCallbacks();
        }

        unregister() {
            for (const h of this.handlers)
                h.unregister();
            this.frameWorker++;
        }

        registerFrameHandler(order: number, handler: () => void): FrameCallback {
            if (!this.frameCallbacks) {
                this.frameCallbacks = [];
                this.registerFrameCallbacks();
            }

            const fn = new FrameCallback()
            fn.order = order
            fn.handler = handler
            for (let i = 0; i < this.frameCallbacks.length; ++i) {
                if (this.frameCallbacks[i].order > order) {
                    this.frameCallbacks.insertAt(i, fn)
                    return fn;
                }
            }
            this.frameCallbacks.push(fn);
            return fn;
        }

        unregisterFrameHandler(fn: FrameCallback) {
            if (!fn || !this.frameCallbacks) return;
            const i = this.frameCallbacks.indexOf(fn);
            if (i > -1)
                this.frameCallbacks.splice(i, 1);
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

        addIdleHandler(handler: () => void) {
            if (!this.idleCallbacks) {
                this.idleCallbacks = [];
                this.registerHandler(15/*DAL.DEVICE_ID_SCHEDULER*/, 2/*DAL.DEVICE_SCHEDULER_EVT_IDLE*/, () => this.runIdleHandler(), 16);
            }
            this.idleCallbacks.push(handler);
        }

        removeIdleHandler(handler: () => void) {
            if (handler && this.idleCallbacks)
                this.idleCallbacks.removeElement(handler);
        }

        private runIdleHandler() {
            if (this.idleCallbacks) {
                const ics = this.idleCallbacks.slice(0);
                ics.forEach(ic => ic());
            }
        }
    }
    let eventContexts: EventContext[];

    /**
     * Gets the current event context if any
     */
    export function eventContext(): EventContext {
        return eventContexts ? eventContexts[eventContexts.length - 1] : undefined;
    }

    /**
     * Pushes a new event context and clears all handlers
     */
    export function pushEventContext(): EventContext {
        if (!eventContexts)
            eventContexts = [];

        // unregister previous context
        const ctx = eventContext();
        if (ctx) ctx.unregister();
        // register again
        const n = new EventContext();
        eventContexts.push(n);
        return n;
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

    let _idleCallbacks: (() => void)[];
    /**
     * Registers a function to run when the device is idling
     * @param handler
    */
    export function onIdle(handler: () => void) {
        if (!handler) return;

        const ctx = eventContext();
        if (ctx) ctx.addIdleHandler(handler);
        else {
            if (!_idleCallbacks) {
                _idleCallbacks = [];
                control.runInBackground(function () {
                    while (_idleCallbacks) {
                        _idleCallbacks.slice(0).forEach(cb => cb());
                        pause(20);
                    }
                })
                /*
                control.internalOnEvent(
                    15. // DAL.DEVICE_ID_SCHEDULER
                    2, // DAL.DEVICE_SCHEDULER_EVT_IDLE
                    function() {
                        pins.LED.digitalWrite(on = !on);
                        if (_idleCallbacks)
                            _idleCallbacks.slice(0).forEach(cb => cb());
                    }, 192); // MESSAGE_BUS_LISTENER_IMMEDIATE
                */
            }
            _idleCallbacks.push(handler);
        }
    }

    export function removeIdleHandler(handler: () => void) {
        if (!handler) return;
        const ctx = eventContext();
        if (ctx) ctx.removeIdleHandler(handler);
        else if (_idleCallbacks) _idleCallbacks.removeElement(handler);
    }
}