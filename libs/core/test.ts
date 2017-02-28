let v0 = 0
let v1 = 0
input.rightButton.onEvent(ButtonEvent.Click, () => {
    pins.LED.digitalWrite(v0)
    v0 = v0 ? 0 : 1
})



let strip = light.createNeoPixelStrip()
strip.setBrightness(20)
strip.show()

function flash(n: number) {
    control.runInBackground(() => {
        strip.setPixelColor(n, 0x0000ff)
        strip.show()
        control.pause(1000)
        strip.setPixelColor(n, 0x000000)
        strip.show()
    })
}

input.leftButton.onEvent(ButtonEvent.Click, () => {
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


let i = 0
control.forever(() => {
    control.pause(100)
})
