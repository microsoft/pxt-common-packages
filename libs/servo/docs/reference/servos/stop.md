# stop

Stop sending commands to the servo so that its rotation will stop at the current position.

```sig
servos.P0.stop()
```

A servo is stopped by not sending anymore commands to drive the rotation angle. This lets you stop a servo at its current postion which is useful for stopping a continuous rotation servo. The servo drive is stopped but it's shaft has no force on it to lock the current position.

## Example

Connect a servo to pin `P0`. Rotate the servo clockwise at `75` percent of full speed. Wait `3` seconds and then stop the servo.

```blocks
servos.P0.run(75)
basic.pause(3000)
servos.P0.stop()
```

## See also

[run](/reference/servos/run),
[set angle](/reference/servos/set-angle)

```package
servo
```
