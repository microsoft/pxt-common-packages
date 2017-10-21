# photon Forward

Move a photon effect along the pixel strip by a number of steps.

```sig
light.pixels.photonForward(0)
```

The photon effect is a burst of light that moves along the pixel strip. To make
an effect with quicker movement, you can advance the photon by more than just
one pixel at a time, just make the step number bigger.

## Parameters

* **steps**: the [number](/types/number) of pixel spots to move the photon

## Example

Move a photon across the entire length of the pixel strip.

```blocks
for (let i = 0; i < light.pixels.length(); i++) {
    light.pixels.photonForward(1)
    loops.pause(150)
}
```
## See also

[``||photon flip||``](/reference/light/photon-flip)
[``||set photon pen color||``](/reference/light/set-photon-pen-color),
[``||photon mode||``](/reference/light/set-photon-mode)

```package
light
```


