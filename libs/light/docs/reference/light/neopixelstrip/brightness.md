# brightness

Get the brightness of the pixels on the strip (or on the board).

```sig
light.createStrip().brightness()
```

## Returns

* a [number](/types/number) between 0 (no light) and 255 (super bright). 

## Example

Set all the pixels to ``white``. Dim the pixels when button `A` is pressed and
brighten the pixels when button `B` is pressed.

```blocks
let strip = light.createStrip()
strip.setAll(Colors.White)

input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.setBrightness(strip.brightness() - 1)
})

input.buttonB.onEvent(ButtonEvent.Click, () => {
    strip.setBrightness(strip.brightness() + 1)
})
```

## See Also

[``||setBrightness||``](/reference/light/neopixelstrip/set-brightness)

```package
light
```
