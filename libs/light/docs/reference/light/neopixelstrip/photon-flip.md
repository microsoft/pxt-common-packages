# photon Flip

Change the direction of the photon movement along the pixel strip.

```sig
light.createStrip().photonFlip()
```

The photon normally moves in the direction from a low numbered pixels (pixel: 0, 1, 2, ...)
 to higher numbered pixels. You can make the photon move in the opposite direction with
 ``||photon flip||``. Every time you use ``||photon flip||``, the photon burst changes
 direction and moves in the opposite way.

## Example

Move a photon forward and backward across the pixel strip for `5` bursts.

```blocks
let strip = light.createStrip()
for (let i = 0; i <= 5; i++) {
    for (let j = 0; j < strip.length(); j++) {
        strip.photonForward(1)
        pause(50)
    }
    strip.photonFlip()
}
```

## See also

[``||photon forward||``](/reference/light/neopixelstrip/photon-forward),
[``||set photon pen color||``](/reference/light/neopixelstrip/set-photon-pen-color),
[``||photon mode||``](/reference/light/neopixelstrip/set-photon-mode)

```package
light
```


