# analog Write

Write a value of between `0` and `1023` to make a signal at an analog pin.

```sig
pins.A0.analogWrite(0)
```
An analog output at a pin will have an amount of voltage related to the output value
you give to ``||pins:analog write||``. You are setting the amount of _signal_ at the pin.
You use values between `0` (for no signal) and `1023` (for full signal). The actual voltage
on the pin will follow the value you give for the output. So, `0` is no voltage and `1023`
is maximun voltage. The voltage that matches your signal value depends on the
voltage range used by your board.

## Parameters

*  **value**: a [number](types/number) between `0` (no signal) and `1023` (full signal)


## Example #ex1

Create a sawtooth wave signal on pin `A0`.

```blocks
let i = 0
forever(() => {
    i = 0
    while (i <= 1023) {
        pins.A0.analogWrite(i)
        pause(100)
        if (i > 0) {
            i += 128
        } else {
            i += 127
        }
    }
})

```

## See also

[``||analog read||``](/reference/pins/analog-read)