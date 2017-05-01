# Photon Bounce

```blocks
let distance = 0;
let ms = 50;
let n = photon.length()
control.forever(() => {
    photon.setMode(PhotonMode.PenUp);
    photon.setColor(Math.random(255));
    distance = n - 1;
    for (let i = 0; i < n; ++i) {
        for (let i = 0; i < distance; ++i) {
            photon.forward(1);
            control.pause(ms);
        }
        photon.stamp();
        for (let i = 0; i < distance; ++i) {
            photon.backward(1);
            control.pause(ms);
        }
        distance -= 1;
    }
    control.pause(200)
    photon.setMode(PhotonMode.Eraser);
    distance = 1;
    for (let i = 0; i < n; ++i) {
        for (let i = 0; i < distance; ++i) {
            photon.forward(1);
            control.pause(ms);
        }
        for (let i = 0; i < distance; ++i) {
            photon.backward(1);
            control.pause(ms);
        }
        distance += 1;
    }
})
```

```package
light
photon
```