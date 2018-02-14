# Photon Spark

```blocks
let pixels = light.createStrip();

pixels.setPhotonMode(PhotonMode.PenUp);
forever(function() {
    pixels.photonForward(Math.randomRange(0, 10))
    pause(20)
})
```

```package
light
```