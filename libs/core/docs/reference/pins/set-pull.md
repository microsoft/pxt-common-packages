# set Pull

Tell a digital pin use either a high voltage or low voltage to mean that the input signal is off.

```sig
pins.A0.setPull(PinPullMode.PullDown)
```

When you want to use a digital pin to receive an input signal, the pin normally has
a _pull_ direction. This means that while the pin has no input signal, it reads `true` if
the pull direction is `up`. But, if the pull direction is `down`, the pin reads `false`.

To set the pull direction, you decide which voltage you want (high voltage or low voltage) to mean
that an input signal to the pin is turned off. The microprocessor on your board will connect the pin to high
voltage if you set it to pull to `up` and it will connect it to low voltage if you set it to pull `down`.

Now, when you want to cause a signal on the pin, you attach your switch or a sensor so that it
connects the pin to the opposite voltage of the pull direction you gave it. So, for example,
if you set pin `D7` to pull `up`, you attach one lead of a switch to the pin and the other
lead of the switch to low voltage (GND). When you press the switch, pin `D7` is now pulled `low`
by connecting it to the low voltage. We call the pin _signalled_ when this happens.

Of course, if the pin's pull direction is set to `down`, the pin is signalled when it is connected
to high voltage (pulled `high`).

You can have code that waits for a pin to change from `high` to `low`, or `low` to `high`. This is
called a _pulse_ event.

## Parameters

*  **pull**: the pull direction to give the pin
> * `up`: the pin is pulled up (set to high voltage) when it's not signalled and will read `true`.
> * `down`: the pin is pulled down (set to low voltage) when it's not signalled and will read `false`.
> * `none`: the pin is not connected to either high or low voltage. An external resistor or other
electronics will make the pull direction.

## Example #ex1

Set the pull direction for digital pin `D4` to `up`. Flash the LED connected to pin `D13` for
one-fourth of a second when pin `D4` is pulsed `low`.

```blocks
pins.D4.setPull(PinPullMode.PullUp)

pins.D4.onPulsed(PulseValue.Low, () => {
    pins.D13.digitalWrite(true)
    pause(250)
    pins.D13.digitalWrite(false)
})
```

## See Also

[``||digital read||``](/reference/pins/digital-read),
[``||on pulsed||``](/reference/pins/on-pulsed),
[``||pulse in||``](/reference/pins/pulse-in)