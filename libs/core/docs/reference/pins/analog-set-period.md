# analog Set Period

Use this time period for servo commands and other PWM signals.

```sig
pins.A1.analogSetPeriod(20000)
```

With _Pulse Width Modulation (PWM)_, a pulse signal is sent regularly, many times a second.
How many times a pulse is sent in each second decides what period it has. If a _pwm_ signal is sent 50
times a second, then its period is 1/20th of a second which is 20 milliseconds.

You use microseconds for the amount of time you set your _pwm_ signal period. One second is a million
microseconds and 1 millisecond is 1000 microseconds.

## Parameters

* **period**: a [number](types/number) that is the period for the pulse signal sent at the pin.

## Example #ex1

Set the period for a PWM signal to 20 milliseconds.

```blocks
pins.A1.analogSetPeriod(20000)
```

## See Also

[``||servo write||``](/reference/pins/servo-write),
[``||servo set pulse||``](/reference/pins/servo-set-pulse)

[What is PWM?](/reference/pins/what-is-pwm)