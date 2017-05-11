
let strip = light.createNeoPixelStrip()
strip.setBrightness(20)

function flash(n: number) {
    control.runInBackground(() => {
        strip.setPixelColor(n, 0x0000ff)
        loops.pause(1000)
        strip.setPixelColor(n, 0x000000)
    })
}

input.buttonA.onEvent(ButtonEvent.Click, () => {
    flash(0)
})

input.pinA1.onEvent(ButtonEvent.Click, () => {
    flash(1)
})
input.pinA2.onEvent(ButtonEvent.Click, () => {
    flash(1)
})
input.pinA3.onEvent(ButtonEvent.Click, () => {
    flash(1)
})

input.pinA4.onEvent(ButtonEvent.Click, () => {
    flash(1)
})

input.pinA5.onEvent(ButtonEvent.Click, () => {
    flash(2)
})

input.pinA6.onEvent(ButtonEvent.Click, () => {
    flash(3)
})

input.pinA7.onEvent(ButtonEvent.Click, () => {
    flash(4)
})
