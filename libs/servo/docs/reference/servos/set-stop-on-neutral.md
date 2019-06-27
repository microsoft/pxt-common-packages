# set Stop On Neutral

Set a servo to return to the neutral position when it stops.

```sig
servos.P0.setStopOnNeutral(false)
```

When telling a servo to stop, instead just stopping an the current rotation angle, you can have the servo return to the neutral position (`90` degrees) when stopped.

## Parameters

* **enabled**: a [boolean](types/boolean) which, when `true`, sets the servo to return to the neutral position when stopped. Otherwise, if `false`, the servo will remain at its current position when stopped.

## Example

Connect a servo to pin `P0`. Set the servo to go to neutral when stopped. Rotate the servo clockwise at `75` percent of full speed. Wait `3` seconds and then stop the servo.

```blocks
servos.P0.setStopOnNeutral(true)
servos.P0.run(75)
basic.pause(3000)
servos.P0.run(0)
```

## See also

[run](/reference/servos/run),
[stop](/reference/servos/stop)

[Brief Guide to Servos](https://www.kitronik.co.uk/pdf/a-brief-guide-to-servos.pdf)

```package
servo
```
