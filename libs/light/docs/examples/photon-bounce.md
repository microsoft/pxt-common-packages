# Photon Bounce


```blocks
let distance = 0;
let ms = 30;
let p = light.pixels;
let n = p.length()
p.setBrightness(100)
loops.forever(() => {
    p.setPhotonMode(PhotonMode.PenUp);
    p.setPhotonColor(Math.randomRange(0, 255));
    distance = n - 1;
    for (let i = 0; i < n; ++i) {
        for (let i = 0; i < distance; ++i) {
            p.photonForward(1);
            loops.pause(ms);
        }
        p.setPhotonMode(PhotonMode.PenDown);
        p.setPhotonMode(PhotonMode.PenUp);
        for (let i = 0; i < distance; ++i) {
            p.photonForward(-1);
            loops.pause(ms);
        }
        distance -= 1;
    }
    loops.pause(ms)
    p.setPhotonMode(PhotonMode.Eraser);
    distance = 1;
    for (let i = 0; i < n; ++i) {
        for (let i = 0; i < distance; ++i) {
            p.photonForward(1);
            loops.pause(ms);
        }
        for (let i = 0; i < distance; ++i) {
            p.photonForward(-1);
            loops.pause(ms);
        }
        distance += 1;
    }
})
```

```package
light
```