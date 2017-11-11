# stop All Animations

Stop the pixel animation showing right now and any other animations ready to show.

```sig
light.createStrip().stopAllAnimations()

```

## Example

Show the ``rainbow`` aninmation for 10 seconds on start. If the ``A`` button
is pressed before 10 seconds is over, stop the ``rainbow``.

```blocks
let strip = light.createStrip()
input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.stopAllAnimations()
})

strip.showAnimation(light.animation(LightAnimation.Rainbow), 10000)
```

## See Also

[``||show animation||``](/reference/light/neopixelstrip/show-animation)

```package
light
```
