# animation

Create a built-in pixel animation to use when an animation is shown.

```sig
light.animation(LightAnimation.Rainbow)

```
You have several animations to choose from. Pick the one you want to use.

## Parameters

* **kind**: which animation to use:
> * ``comet``: a shooting burst of light
> * ``rainbow``: many colors pulsing around
> * ``sparkle``: bright lights flashing all over
> * ``running lights``: a sequence of lights moving
> * ``theater chase``: theater lights moving along
> * ``color wipe``: a wave of color

## Returns

* the built-in **_animation_** information used by an animation operation.

## Example #exsection

Show the ``sparkle`` aninmation for 2 seconds when the ``A`` button is pressed.

```blocks
let strip = light.createStrip()
input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.showAnimation(light.animation(LightAnimation.Sparkle), 2000)
})
```

## See Also

[``||show animation||``](/reference/light/neopixelstrip/show-animation)

```package
light
```
