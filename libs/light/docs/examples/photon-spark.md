# Photon Spark

```blocks
light.pixels.setPhotonMode(PhotonMode.PenUp);
loops.forever(() => {
    light.pixels.photonForward(Math.random(10))
    loops.pause(20)
})
```

```package
light
```