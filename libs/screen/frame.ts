namespace control {
    let __refresh: () => void
    let __updated = false;

    export function screenRefresh() {
        if (__refresh)
            __refresh()
    }

    export function setupScreenRefresh(refresh: () => void) {
        __updated = true;
        __refresh = refresh;

        control.addFrameHandler(200, () => {
            refresh()
            __updated = true
        })
        refresh()
    }

    // low frequency fallback screen refresh
    control.runInParallel(() => {
        while (true) {
            __updated = false
            pause(200)
            if (!__updated) {
                screenRefresh()
                __updated = true
            }
        }
    })
}
