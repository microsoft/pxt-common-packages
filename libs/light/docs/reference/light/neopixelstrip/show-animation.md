# show Animation

Show a pixel animation on the pixel strip (or on the board) for some amount of time.

```sig
light.createStrip().showAnimation(light.rainbowAnimation, 500)

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
let strip = light.createStrip()
input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.showAnimation(light.cometAnimation, 2000)
})
```

### Do two animations #ex2

Show the ``rainbow`` aninmation for 6 seconds when the ``A`` button is pressed. If button
``B`` is pressed, try to show the ``sparkle`` animation for 2 seconds. You'll
notice that the ``sparkle`` animation has to wait for ``rainbow`` to finish.

```blocks
let strip = light.createStrip()
input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.showAnimation(light.rainbowAnimation, 6000)
})

input.buttonB.onEvent(ButtonEvent.Click, () => {
    strip.showAnimation(light.sparkleAnimation, 2000)
})
```

## See Also

[``||stop all animations||``](/reference/light/neopixelstrip/stop-all-animations) [``||animation||``](/reference/light/neopixelstrip/show-animation)

```package
light
```
