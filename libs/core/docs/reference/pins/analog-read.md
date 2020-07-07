# analog Read

Read an analog input value from a pin.

```sig
pins.A0.analogRead()
```

Your board can read a number value for a _signal_ on an analog pin. A signal is some amount of voltage
measured by a circuit on your board. The value for that signal doesn't actually match its
voltage, but it's a number that means how much signal is there. The number you read for the signal
is something between `0` and `1023`.  A `0` is no signal and `1023` is a full signal.

## Returns

* a [number](types/number) between `0` and `1023` that is amount of signal at the pin.

## Example #example

Read from pin `A2` and write the value to the console.

```blocks
forever(function() {
    let signal = pins.A2.analogRead()
    console.log("signal", signal)
    pause(1000)
})
```

## See also #seealso

[analog write](/reference/pins/analog-write)