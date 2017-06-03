# pulse In

Wait for a pulse to happen on a digital pin and say how long the pulse lasted.

```sig
pins.A0.pulseIn(PulseValue.High)
```

A pulse is a change of voltage at the input of a digital pin. This might happen if a switch connected
to the pin is pressed or a sensor attached to the pin wants to give a signal. A pulse is an action of
changing voltage from high to low, or from low to high. The input to a pin is normally made to stay
at either a high or low voltage when it isn't pulsed (its _unsignalled state_). You can decide what
input value to keep the pin at is when it's not pulsed. You do this by giving it a _pull_ direction
with [``||set pull||``](/reference/pins/set-pull).

You wait for a pulse on a pin, going from either `high` to `low`, or `low` to `high`. A pulse **value** of `high` is
used when you are waiting for an input change from `low` to `high`. A pulse **value** of `low` is used to wait for 
a change of input going from `high` to `low`.

When it notices a pulse in the direction it's waiting for, ``||pulse in||`` stops waiting and tells you
how long the pulse lasted. It won't wait forever though. There is a time limit of 2 seconds to wait for
the pulse to happen and 2 seconds for the pulse to finish. If the pulse takes too long to happen or lasts for
too long, ``||pulse in||`` will just say the pulse lasted for no time, 0 microseconds. If you don't want to wait for
2 seconds, you can use a smaller amount of time in **maxDuration**. The amount of time
is in microseconds (1 second = 1000000 microseconds).

## Parameters

* **value**: a the pulse value to wait for, either `high` or `low`.
* **maxDuration**: the longest amount of time to wait for the pulse to happen, in microseconds, like: 50000.

## Returns

* a [number](/types/number) that is how long the pulse happened. The pulse time is a number of microseconds.

## Example #ex1

Check for a `low` pulse on pin `D5` every one-half of a second. Make the first pixel on the pixel strip `red`
if there was a pulse. 

```blocks
let pulseTime = 0
pins.D5.setPull(PinPullMode.PullUp)
loops.forever(() => {
    pulseTime = pins.D5.pulseIn(PulseValue.Low)
    if (pulseTime > 0) {
        light.pixels.setPixelColor(0, Colors.Red)
    } else {
        light.pixels.setPixelColor(0, Colors.Black)        
    }
    loops.pause(500)
})
```

## See Also

[``||digital read||``](/reference/pins/digital-read), [``||set pull||``](/reference/pins/set-pull),
[``||on pulsed||``](/reference/pins/on-pulsed)