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
        control.runInParallel(() => {
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

    let _refresh: () => void

    export function screenRefresh() {
        if (_refresh)
            _refresh()
    }

    export function setupScreenRefresh(refresh: () => void) {
        let updated = true

        _refresh = refresh

        control.addFrameHandler(200, () => {
            refresh()
            updated = true
        })

        // low frequency fallback screen refresh
        control.runInParallel(() => {
            while (true) {
                updated = false
                loops.pause(200)
                if (!updated) {
                    refresh()
                    updated = true
                }
            }
        })

        refresh()
    }
}

namespace loops {
    let frameCb: () => void

    /**
     * Runs code every frame.
     * @param body the code to repeat
     */
    //%
    export function frame(body: () => void): void {
        if (!frameCb)
            control.addFrameHandler(20, () => {
                frameCb()
            })
        frameCb = body
    }
}
