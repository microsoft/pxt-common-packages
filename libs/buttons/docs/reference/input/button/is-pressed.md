# is Pressed

Check if a button is being pressed or not.

```sig
input.buttonA.isPressed()
```

## ~hint
**Touch**

If your board has pins or pads that work as touch inputs, then your code can use them just like buttons.
Instead of saying `button A` or `button B` as the input source, use a pin name like `pin A1`.
```block
if (input.pinA1.isPressed()) {
    light.pixels.setPixelColor(1, Colors.Blue)
}
```
Read about [**touch sensors**](/reference/input/button/touch-sensors) and using the pins as touch buttons.
## ~

## Returns

* a [boolean](types/boolean): `true` if the button is pressed, `false` if the button is not pressed

## Example

Set all the pixels to green when button `A` is pressed. When the button is not pressed, the pixels are red.

```blocks
loops.forever(() => {
    if (input.buttonA.isPressed()) {
        light.pixels.setAll(Colors.Green)
    } else {
        light.pixels.setAll(Colors.Red)
    }
})
```

## See Also
[``||was pressed||``](/reference/input/button/was-pressed),
[``||on event||``](/reference/input/button/on-event)

[Touch sensors](/reference/input/button/touch-sensors)