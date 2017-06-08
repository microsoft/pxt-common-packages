# pulse Duration

Get the length of time for last pulse at any of the digital pins.

```sig
pins.pulseDuration()
```

If you have code in an [``||on pulsed||``](/reference/pins/on-pulsed) event and you want to know how long the pulse lasted on that pin, use ``||pulse duration||``. 

The ``||pulse duration||`` block remembers how many microseconds the last pulse was. This is only for the most
recent pulse period that happened at any of the pins. So, you use it in an ``||on pulsed||`` event block so that
you know which pin the pulse was on.

## Returns

* a [number](/types/number) that is length of time (duration) of the last pulse, in microseconds.

## Example #ex1

Count every pulse on pin `D4` that is longer than 2 milleseconds in duration. Write the total
number of pulses to the serial port every time the count adds another thousand pulses.

```blocks
let pulses = 0
pins.D4.setPull(PinPullMode.PullUp)

pins.D4.onPulsed(PulseValue.Low, () => {
    if (pins.pulseDuration() > 2000) {
        pulses++
    }
    if (pulses % 1000 == 0) {
        serial.writeValue("pulse count", pulses)
    }
})
```

## See Also

[``||digital read||``](/reference/pins/digital-read), [``||set pull||``](/reference/pins/set-pull),
[``||on pulsed||``](/reference/pins/on-pulsed)