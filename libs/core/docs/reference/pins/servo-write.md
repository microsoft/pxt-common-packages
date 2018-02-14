# servo Write

Tell a servo to rotate to some angle or turn at a certain speed.

```sig
pins.A1.servoWrite(90)
```

Servos turn a shaft in one of two of directions by an amount of angle in degrees. With a servo,
you are using just 180 degrees to position an arm, gear, or wheel that is connected to the shaft. The position
at 90 degrees is the base, or neutral position. To turn the servo shaft left (counter-clockwise) you
write to it a number of degrees to the between 0 and 90. The `0` degree spot is all the way left and
any other number up to `90` is somewhere between left and the neutral position. The same thing works
for going all the way to the right (clockwise). All the way to the right is `180` degrees.

### Continuous rotation

Now, there is another type of servo called a _continuous rotation_ servo that might look the same as a regular
servo. It's different because the shaft doesn't stop at a particular position in degrees. In this case,
the number you write to the servo is not degrees but a speed number. The shaft keeps rotating if
you write a number other than `90` to the servo. Instead of being an angle of degrees, the number is
a speed rating in one of the directions. The number `0` is full speed rotating to the left and
`180` is full speed rotating to the right. The number `90` is no rotation in any direction.

## Parameters

* **value**: a [number](types/number) for shaft angle or servo speed, depends on your servo type:
> * _regular servo_: the number of degrees of angle to turn the shaft.

>> * `90` is the neutral, or center, position.
>> * `90` to `0`, the shaft turns to a position towards the left.
>> * `0` is all the way turned to the left.
>> * `90` to `180`, the shaft to a position towards the right.
>> * `180` is all the way turned to the right.

> * _continuous rotation_: the speed to turn the shaft in one direction or the other.
>> * `0` full speed rotating to the _left_.
>> * `90` to `0`, the shaft spins faster rotating to the _left_ as the number goes to `0`.
>> * `90` no speed, shaft doesn't turn.
>> * `90` to `180`, the shaft spins faster rotating to the _right_ as the number reaches `180`.
>> * `180` full speed rotating to the _right_.

## Example #ex1

Connect a servo to pin `A1`. Wag (rotate right and left) the arm on the servo shaft 45 degrees in each
direction for 5 times.

```blocks
for (let i = 1; i <= 5; i++) {
    pins.A1.servoWrite(135)
    pause(500)
    pins.A1.servoWrite(45)
    pause(500)
}
```

## See Also

[``||servo set pulse||``](/reference/pins/servo-set-pulse),
[``||analog set period||``](/reference/pins/analog-set-period)

[What is PWM](/reference/pins/what-is-pwm)