# Photon Spark

```blocks
let pixels = light.createStrip();

pixels.setPhotonMode(PhotonMode.PenUp);
loops.forever(function() {
    pixels.photonForward(Math.randomRange(0, 10))
    loops.pause(20)
})
```

```package
light
```