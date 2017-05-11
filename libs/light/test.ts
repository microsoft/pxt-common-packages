
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

input.pinA8.onEvent(ButtonEvent.Click, () => {
    flash(5)
})

input.pinA9.onEvent(ButtonEvent.Click, () => {
    flash(6)
})

input.pinA10.onEvent(ButtonEvent.Click, () => {
    flash(7)
})

input.pinA11.onEvent(ButtonEvent.Click, () => {
    flash(8)
})