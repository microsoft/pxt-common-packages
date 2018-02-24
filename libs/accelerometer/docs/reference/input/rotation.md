# Rotation

Find how much the @boardname@ is tilted in one direction.

```sig
input.rotation(Rotation.Roll);
```

## ~hint

The @boardname@ has a part on it called the **accelerometer** that can
check the ways that the @boardname@ is moving.

## ~

## Parameters

* ``kind`` the direction you are checking:
> * `Pitch`: up or down
> * `Roll`: left or right

## Returns

* a [number](/types/number) that tells how much the @boardname@ is tilted in the direction you say, from `0` to `360` degrees

## Example: @boardname@ leveler #example

This program helps you move the @boardname@ until it is level. When
it is levelled, the @boardname@ shows turns blue.

```blocks
let roll = 0
let pitch = 0
let pixels = light.createStrip();
forever(() => {
    pitch = input.rotation(Rotation.Pitch)
    roll = input.rotation(Rotation.Roll)
    if (Math.abs(pitch) < 10 && Math.abs(roll) < 10) {
        pixels.setAll(light.colors(Colors.Blue))
    } else {
        pixels.setAll(light.colors(Colors.Red))
    }
});
```
### ~hint
**Simulator**

If you are running this program in a browser, you can tilt the @boardname@ with your mouse.
### ~

## See also #seealso

[acceleration](/reference/input/acceleration)

```package
accelerometer
```