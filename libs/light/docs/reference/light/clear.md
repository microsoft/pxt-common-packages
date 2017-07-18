# clear

Turn off all the pixel LEDs.

```sig
light.pixels.clear()

```

## Example

Turn off all the pixels when button `A` is pressed.

```blocks
light.pixels.setAll(Colors.Green)
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.clear()
})

```

## See Also

[``||set All||``](/reference/light/set-all)

```package
light
```
