# Photon Spark

```blocks
light.pixels.setPhotonMode(PhotonMode.PenUp);
loops.forever(() => {
    light.pixels.photonForward(Math.randomRange(0, 10))
    loops.pause(20)
})
```

```package
light
```