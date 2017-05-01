# Photon Bounce

```blocks
let distance = 0;
let n = light.pixels.length();
control.forever(() => {
    photon.setColor(Math.random(255));
    photon.setMode(PhotonPenMode.Up);
    distance = n - 1;
    for(let i = 0; i < n; ++i) {
        for(let i = 0; i < distance; ++i) {
            photon.forward(1);
            control.pause(10);           
        }
        photon.stamp();
        for(let i = 0; i < distance; ++i) {
            photon.backward(1);
            control.pause(10);           
        }
        distance -= 1;
    }
    photon.setMode(PhotonPenMode.Erase);
    distance = 1;
    for(let i = 0; i < n; ++i) {
        for(let i = 0; i < distance; ++i) {
            photon.forward(1);
            control.pause(10);           
        }
        for(let i = 0; i < distance; ++i) {
            photon.backward(1);
            control.pause(10);           
        }        
    }
})
```

```package
light
photon
```