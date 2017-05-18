loops.forever(() => {
    let level = input.soundLevel()
    serial.writeValue("sound", level)
})
input.onLoudSound(() => {
    serial.writeLine("loud")
})
