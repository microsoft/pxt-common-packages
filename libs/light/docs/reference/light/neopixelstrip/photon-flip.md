# photon Flip

Change the direction of the photon movement along the pixel strip.

```sig
light.pixels.photonFlip()
```

The photon normally moves in the direction from a low numbered pixels (pixel: 0, 1, 2, ...)
 to higher numbered pixels. You can make the photon move in the opposite direction with
 ``||photon flip||``. Every time you use ``||photon flip||``, the photon burst changes
 direction and moves in the opposite way.

## Example

Move a photon forward and backward across the pixel strip for `5` bursts.

```blocks
for (let i = 0; i <= 5; i++) {
    for (let j = 0; j < light.pixels.length(); j++) {
        light.pixels.photonForward(1)
        loops.pause(50)
    }
    light.pixels.photonFlip()
}
```

## See also

[``||photon forward||``](/reference/light/neopixelstrip/photon-forward),
[``||set photon pen color||``](/reference/light/neopixelstrip/set-photon-pen-color),
[``||photon mode||``](/reference/light/neopixelstrip/set-photon-mode)

```package
light
```


