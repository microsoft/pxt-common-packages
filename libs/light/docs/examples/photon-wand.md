# Photon Wand

```blocks
let c = 0;
input.onGesture(Gesture.Shake, () => {
    light.pixels.clear()
    light.pixels.setPhotonMode(PhotonMode.PenUp)
    music.startMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.OnceInBackground)
    for (let i = 0; i < 50; i++) {
        light.pixels.photonForward(Math.randomRange(0, 51))
        loops.pause(20)
    }
    light.pixels.setPhotonMode(PhotonMode.PenDown)
})
loops.forever(() => {
    light.pixels.photonForward(1)
    light.pixels.setPhotonPenHue(c)
    c += 16
})
```

```package
light
```