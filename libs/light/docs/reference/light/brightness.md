# brightness

Get the brightness of the pixels on the strip (or on the board).

```sig
light.pixels.brightness()
```

## Returns

* a [number](/types/number) between 0 (no light) and 255 (super bright). 

## Example

Set all the pixels to ``white``. Dim the pixes when button `A` is pressed and
brighten the pixels when button `B` is pressed.

```blocks
light.pixels.setAll(Colors.White)

input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.setBrightness(light.pixels.brightness() - 1)
})

input.buttonB.onEvent(ButtonEvent.Click, () => {
    light.pixels.setBrightness(light.pixels.brightness() + 1)
})
```

## See Also

[``||setBrightness||``](/reference/light/set-brightness)

```package
light
```
