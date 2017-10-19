# set Photon Pen Color

Change the color of the photon pixels on the pixel strip.

```sig
light.pixels.setPhotonColor(0)
```

The photon effect is a pulse of bright light moving through a strip of colored pixels.
You can change the color of the photon to whatever you want.

## Parameters

* an RGB color

## Example

Pulse an blue photon forward and backward across the pixel strip.

```blocks
light.pixels.setPhotonColor(Colors.Blue)
loops.forever(() => {
    for (let i = 0; i < light.pixels.length(); i++) {
        light.pixels.photonForward(1)
        loops.pause(100)
    }
    light.pixels.photonFlip()
})
```
## See also

[``||photon forward||``](/reference/light/photon-forward),
[``||photon flip||``](/reference/light/photon-flip),
[``||photon mode||``](/reference/light/set-photon-mode)

```package
light
```


