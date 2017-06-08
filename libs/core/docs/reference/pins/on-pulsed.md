# on Pulsed

Run some code when a pin is pulsed `high` or `low`.

```sig
pins.A0.onPulsed(PulseValue.High, () => {})
```

A pulse is a change of voltage at the input of a digital pin. This might happen if a switch connected
to the pin is pressed or a sensor attached to the pin wants to give a signal. A pulse is an action of
changing voltage from high to low, or from low to high. The input to a pin is normally made to stay
at either a high or low voltage when it isn't pulsed (its _unsignalled state_). You can decide what
input value to keep the pin at is when it's not pulsed. You do this by giving it a _pull_ direction
with [``||set pull||``](/reference/pins/set-pull).

Your code is inside an event block that starts when the input voltage at the pin changes. You give the
pulse direction  you want the code to run for. Make the value for **pulse** be `high` if you want
the code to start when the pin changes from a low voltage to a high voltage. Use `low` for **pulse** if
you want your code to run when the voltage at the pin goes from high to low.

## Parameters

* **pulse**: the pulse value to run code for, either `high` or `low`.
* **body**: the code to run when the pin is pulsed.

## Example #ex1

When pin `D4` is pulsed `low`, run code that flashes an LED connected to pin `D13` .

```blocks
pins.D4.setPull(PinPullMode.PullUp)

pins.D4.onPulsed(PulseValue.Low, () => {
    pins.D13.digitalWrite(true)
    loops.pause(250)
    pins.D13.digitalWrite(false)
})
```

## See Also

[``||pulse in||``](/reference/pins/pulse-in), [``||set pull||``](/reference/pins/set-pull)