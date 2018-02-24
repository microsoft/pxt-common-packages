# Photon Rainbow

```blocks
let c = 0;
let pixels = light.createStrip();
forever(function() {
    pixels.setPhotonPenHue(c);
    pixels.photonForward(1);
    c += 16;
})
```

```package
light
```