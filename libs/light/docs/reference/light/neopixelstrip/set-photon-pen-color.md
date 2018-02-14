# set Photon Pen Color

Change the color of the photon pixels on the pixel strip.

```sig
light.createStrip().setPhotonPenColor(0)
```

The photon effect is a pulse of bright light moving through a strip of colored pixels.
You can change the color of the photon to whatever you want.

## Parameters

* an RGB color

## Example

Pulse an blue photon forward and backward across the pixel strip.

```blocks
let strip = light.createStrip()
strip.setPhotonPenColor(Colors.Blue)
forever(() => {
    for (let i = 0; i < strip.length(); i++) {
        strip.photonForward(1)
        pause(100)
    }
    strip.photonFlip()
})
```
## See also

[``||photon forward||``](/reference/light/neopixelstrip/photon-forward),
[``||photon flip||``](/reference/light/neopixelstrip/photon-flip),
[``||photon mode||``](/reference/light/neopixelstrip/set-photon-mode)

```package
light
```


