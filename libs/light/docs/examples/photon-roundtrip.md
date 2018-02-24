# Photon Roundtrip

```blocks
let pixels = light.createStrip();

input.buttonA.onEvent(ButtonEvent.Click, function() {
    pixels.setPhotonMode(PhotonMode.PenDown);
    pixels.setPhotonPenHue(Math.randomRange(0, 256));
    for (let i = 0; i < 10; i++) {
        pixels.photonForward(1);
        pause(50);
    }
    pause(1000);
    pixels.setPhotonMode(PhotonMode.Eraser);
    for (let i = 0; i < 10; i++) {
        pixels.photonForward(-1);
        pause(50);
    }
});
```