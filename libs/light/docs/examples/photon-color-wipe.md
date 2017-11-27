# Photon Color Wipe

```blocks
let pixels = light.createStrip();
loops.forever(function() {
    pixels.setPhotonPenHue(Math.randomRange(0, 256))
    pixels.setPhotonMode(PhotonMode.PenDown);
    for (let i = 0; i < 9; i++) {
        pixels.photonForward(1);
        loops.pause(20);
    }
    pixels.setPhotonMode(PhotonMode.Eraser);
    for (let i = 0; i < 9; i++) {
        pixels.photonForward(1);
        loops.pause(20);
    }
})
```