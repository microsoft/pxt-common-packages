# stop All Animations

Stop the pixel animation showing right now and any other animations ready to show.

```sig
light.pixels.stopAllAnimations()

```

## Example

Show the ``rainbow`` aninmation for 10 seconds on start. If the ``A`` button
is pressed before 10 seconds is over, stop the ``rainbow``.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.stopAllAnimations()
})

light.pixels.showAnimation(light.rainbowAnimation)
```

## See Also

[``||show animation||``](/reference/light/show-animation)

```package
light
```
