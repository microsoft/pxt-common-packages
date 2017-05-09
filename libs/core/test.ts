let v0 = 0
let v1 = 0
input.buttonB.onEvent(ButtonEvent.Click, () => {
    v0 = v0 ? 0 : 1
})


let i = 0
loops.forever(() => {
    loops.pause(100)
})
