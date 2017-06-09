# digital Read

Read a digital `false` or `true` from a pin.

```sig
pins.A0.digitalRead()
```
Digital pins read one of two values: `false` or `true`. Often the `false` means something connected
to the pin is turned **off** or its status is `false`. In a similar way, `true` means something
connected to the pin is **on** or has a status of `true`.

## Returns

* a [boolean](types/boolean) value that is either `false` or `true`. The meaning of the value depends on how something connected to the pin decides on what value to give.

## Example #ex1

See if a switch on your bread board is on or off. The switch is connected to pin `D4`. If
the switch is on, change the pixel at position `2` on the pixel strip to `green`.

```blocks
let mySwitchOn = pins.D4.digitalRead()
if (mySwitchOn) {
    light.pixels.setPixelColor(2, Colors.Green)
} else {
    light.pixels.setPixelColor(2, Colors.Red)    
}
```

## See Also

[``||digital write||``](/reference/pins/digital-write)