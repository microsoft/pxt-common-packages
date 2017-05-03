# Photon Wand

```blocks
input.onGesture(Gesture.Shake, () => {
    photon.clean()
    photon.setMode(PhotonMode.PenUp)
    music.beginMelody(pins.A8, music.builtInMelody(Melodies.JumpUp), MelodyOptions.OnceInBackground)
    for (let i = 0; i < 50; i++) {
        photon.forward(Math.random(51))
        control.pause(20)
    }
    photon.setMode(PhotonMode.PenDown)
})
loops.forever(() => {
    photon.forward(1)
    photon.changeColorBy(1)
})
```