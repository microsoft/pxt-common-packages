let v0 = 0
let v1 = 0
input.rightButton.onEvent(ButtonEvent.Click, () => {
    pins.LED.digitalWrite(v0)
    v0 = v0 ? 0 : 1
})


let i = 0
control.forever(() => {
    control.pause(100)
})
