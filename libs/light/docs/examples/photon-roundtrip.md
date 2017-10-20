# Photon Roundtrip

```blocks
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.setPhotonMode(PhotonMode.PenDown)
    light.pixels.setPhotonPenHue(Math.randomRange(0, 256))
    for (let i = 0; i < 10; i++) {
        light.pixels.photonForward(1)
        loops.pause(50)
    }
    loops.pause(1000)
    light.pixels.setPhotonMode(PhotonMode.Eraser)
    for (let i = 0; i < 10; i++) {
        light.pixels.photonForward(-1)
        loops.pause(50)
    }
})
```