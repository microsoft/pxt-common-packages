namespace control {
    class Callback {
        order: number
        handler: () => void
    }

    let callbacks: Callback[]

    let frameNo = 0
    let framesInSample = 0
    let timeInSample = 0

    export let deltaTime = 0

    function init() {
        if (callbacks) return
        callbacks = []
        let prevTime = control.millis()
        control.runInBackground(() => {
            while (true) {
                frameNo++
                let loopStart = control.millis()
                deltaTime = (loopStart - prevTime) / 1000.0
                prevTime = loopStart
                for (let f of callbacks) {
                    f.handler()
                }
                let runtime = control.millis() - loopStart
                timeInSample += runtime
                framesInSample++
                if (timeInSample > 1000 || framesInSample > 30) {
                    _screen_internal._stats(`render: ${Math.round(timeInSample / framesInSample * 1000)}us`)
                    timeInSample = 0
                    framesInSample = 0
                }
                let delay = Math.max(1, 20 - runtime)
                loops.pause(delay)
            }
        })
    }

    export function clearHandlers() {
        init()
        callbacks = callbacks.filter(c => c.order >= 200)
    }

    export function addFrameHandler(order: number, handler: () => void) {
        init()
        let fn = new Callback()
        fn.order = order
        fn.handler = handler
        for (let i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].order > order) {
                callbacks.insertAt(i, fn)
                return
            }
        }
        callbacks.push(fn)
    }
}

namespace loops {
    /**
     * Runs code every frame.
     * @param body the code to repeat
     */
    //% block
    export function frame(body: () => void): void {
        control.addFrameHandler(100, body)
    }
}
