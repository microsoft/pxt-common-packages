control.forever(() => {
    let level = input.soundLevel()
    serial.writeValue("sound", level)
})
input.onSoundConditionChanged(LoudnessCondition.Quiet, () => {
    serial.writeLine("quiet")
})
input.onSoundConditionChanged(LoudnessCondition.Quiet, () => {
    serial.writeLine("loud")
})
