# Rotation

Find how much the @boardname@ is tilted in different directions.

```sig
input.rotation(Rotation.Roll);
```

## ~hint

The @boardname@ has a part called the **accelerometer** that can
check how the @boardname@ is moving.

## ~

### Parameters

* ``kind`` means which direction you are checking: `Rotation.Pitch` (up and down) or `Rotation.Roll` (left and right)

### Returns

* a [number](/types/number) that means how much the microbit is tilted in the direction you say, from `0` to `360` degrees

### Example: @boardname@ leveler #example

This program helps you move the @boardname@ until it is level. When
it is levelled, the @boardname@ shows turns blue.

If you are running this program in a browser, you can tilt the
@boardname@ with your mouse.


```blocks
let roll = 0
let pitch = 0
control.forever(() => {
    pitch = input.rotation(Rotation.Pitch)
    roll = input.rotation(Rotation.Roll)
    if (Math.abs(pitch) < 10 && Math.abs(roll) < 10) {
        light.pixels.showColor(light.colors(NeoPixelColors.Blue))
    } else {
        light.pixels.showColor(light.colors(NeoPixelColors.Red))
    }
});
```

### See also

[acceleration](/reference/input/acceleration), [compass-heading](/reference/input/compass-heading)

```package
accelerometer
```