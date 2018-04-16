# set Brightness

Set the brightness of all the pixels on the pixel strip.

```sig
light.createStrip().setBrightness(0)
```

## Parameters

* **brightness**: the new brightness of all the pixels in the strip. This is a [number](/types/number) between 0 (no light) and 255 (super bright). 

## Example

Set all the pixels to ``white``. Dim the pixels when button `A` is pressed and
brighten the pixels when button `B` is pressed.

```blocks
let strip = light.createStrip()
strip.setAll(0xffffff)

input.buttonA.onEvent(ButtonEvent.Click, () => {
    strip.setBrightness(strip.brightness() - 1)
})

input.buttonB.onEvent(ButtonEvent.Click, () => {
    strip.setBrightness(strip.brightness() + 1)
})
```

## See Also

[``||brightness||``](/reference/light/neopixelstrip/brightness),
[``||set pixel white led||``](/reference/light/neopixelstrip/set-pixel-white-led)

```package
light
```
