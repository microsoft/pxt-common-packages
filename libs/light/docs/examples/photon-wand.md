# Photon Wand

```blocks
let c = 0;
let pixels = light.createStrip();

input.onGesture(Gesture.Shake, function() {
    pixels.clear();
    pixels.setPhotonMode(PhotonMode.PenUp);
    music.playSound(music.sounds(Sounds.JumpUp));

    for (let i = 0; i < 50; i++) {
        pixels.photonForward(Math.randomRange(0, 51));
        loops.pause(20);
    }
    pixels.setPhotonMode(PhotonMode.PenDown);
})
loops.forever(function() {
    pixels.photonForward(1);
    pixels.setPhotonPenHue(c);
    c += 16;
});
```

```package
light
```