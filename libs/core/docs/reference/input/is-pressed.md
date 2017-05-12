# is Pressed

Check if a button is being pressed or not.

```sig
input.buttonA.isPressed()
```

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
[``||was pressed||``](/reference/input/was-pressed)