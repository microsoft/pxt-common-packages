# clear

Turn off all the pixel LEDs.

```sig
light.createStrip().clear()

```

## Example

Turn off all the pixels when button `A` is pressed.

```blocks
let strip = light.createStrip()
strip.setAll(0x00ff00)
input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.clear()
})
```

## See Also

[``||set All||``](/reference/light/neopixelstrip/set-all)

```package
light
```
