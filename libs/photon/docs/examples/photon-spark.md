# Photon Spark

```blocks
photon.setMode(PhotonPenMode.PenUp);
loops.forever(() => {
    photon.forward(Math.random(10))
    control.pause(20)
})
```

```package
light
photon
```