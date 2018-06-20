forever(() => {
    let level = input.soundLevel()
    console.logValue("sound", level)
})
input.onLoudSound(() => {
    console.log("loud")
})
