# set Range

Set the minimum and maximum rotation angles for a servo.

```sig
servos.P0.setRange(0, 180)
```

If you want to limit the rotation range of a servo you can set it's minimum and maximum rotation angle. The minimum angle limit is set in degrees from `0` to `90`. The maximum rotation angle is set in degress from `90` to `180`.

## Parameters

* **minAngle**: a [number](types/number) of degrees to set as the minimum rotation angle, `0` - `90` degrees,
* **maxAngle**: a [number](types/number) of degrees to set as the maximum rotation angle, `90` - `180` degrees,

## Example

Connect a servo to pin `P0`. Try to rotate the servo past it range angles.

```blocks
servos.P0.setRange(30, 150)
for (let i = 0; i < 5; i++) {
    servos.P0.setAngle(180)
    basic.pause(500)
    servos.P0.setAngle(0)
    basic.pause(500)
}
```

## See also

[set angle](/reference/servos/set-angle)

[Brief Guide to Servos](https://www.kitronik.co.uk/pdf/a-brief-guide-to-servos.pdf)

```package
servo
```
