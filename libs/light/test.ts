
let strip = light.createNeoPixelStrip()
strip.setBrightness(20)

function flash(n: number) {
    control.runInBackground(() => {
        strip.setPixelColor(n, 0x0000ff)
        loops.pause(1000)
        strip.setPixelColor(n, 0x000000)
    })
}

flash(0)

