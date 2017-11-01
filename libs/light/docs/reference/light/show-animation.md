# show Animation

Show a pixel animation on the pixel strip (or on the board) for some amount of time.

```sig
light.pixels.showAnimation(light.rainbowAnimation)

```
You have several animations to choose from. Pick the one you want and decide
how long you want the animation to play for.

If your program is showing another animation right now, this animation is set to
show later and your program continues right away. If there are no other animations
ready to show, then your program will show this one and wait for it to finish.

## Parameters

* **animation**: a built-in light animation to show on the pixels.
> * ``comet``: a shooting burst of light
> * ``rainbow``: many colors pulsing around
> * ``sparkle``: bright lights flashing all over
> * ``running lights``: a sequence of lights moving
> * ``theater chase``: theater lights moving along
> * ``color wipe``: a wave of color
* **duration**: the amount of time to run the animation, in milliseconds.

## Examples #exsection

### Show me a comet #ex1

Show the ``comet`` aninmation for 2 seconds when the ``A`` button is pressed.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.showAnimation(light.cometAnimation)
})
```

## See Also

[``||stop all animations||``](/reference/light/stop-all-animations) [``||animation||``](/reference/light/show-animation)

```package
light
```
