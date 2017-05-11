# Photon Rainbow

```blocks
let c = 0;
loops.forever(() => {
    light.pixels.setPhotonColor(c)
    light.pixels.photonForward(1)
    c += 16;
})
```

```package
light
```