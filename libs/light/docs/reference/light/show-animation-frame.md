# show Animation Frame

Show a single part of pixel animation on the pixel strip (or on the board).

```sig
light.pixels.showAnimationFrame(light.rainbowAnimation)
```
You can show the colors from a pixel animation without having to play the whole animation. Just pick
one of the built-in animations to see its first frame.

## Parameters

* **animation**: a built-in light animation to show a frame from on the pixels.
> * ``comet``: a shooting burst of light
> * ``rainbow``: many colors pulsing around
> * ``sparkle``: bright lights flashing all over
> * ``running lights``: a sequence of lights moving
> * ``theater chase``: theater lights moving along
> * ``color wipe``: a wave of color

## Examples #exsection

Show the first part of the ``comet`` aninmation.

```blocks
light.pixels.showAnimationFrame(light.cometAnimation)
```
## See Also

[``||show animation||``](/reference/light/show-animation)

```package
light
```
