namespace control {
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
                pause(200)
                if (!updated) {
                    refresh()
                    updated = true
                }
            }
        })

        refresh()
    }
}
