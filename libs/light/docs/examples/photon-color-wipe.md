# Photon Color Wipe

```blocks
loops.forever(() => {
    light.pixels.setPhotonColor(Math.randomRange(0, 256))
    light.pixels.setPhotonMode(PhotonMode.PenDown)
    for (let i = 0; i < 9; i++) {
        light.pixels.photonForward(1)
        loops.pause(20)
    }
    light.pixels.setPhotonMode(PhotonMode.Eraser)
    for (let i = 0; i < 9; i++) {
        light.pixels.photonForward(1)
        loops.pause(20)
    }
})
```