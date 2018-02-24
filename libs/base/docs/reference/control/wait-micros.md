# wait Micros

Make the part of the program running right now wait for some number of microseconds.

```sig
control.waitMicros(10)
```
The code inside the current block, such as a ``||on start||``, ``||control:run in parallel||``, and 
``||control:on event||`` , waits for some amount of time. The time number is in microseconds (one-millionth of a second).

## Parameters

* **micros**: the [number](/types/number) of microseconds for this block of code to wait for.

## Example #example

Turn on an a sensor that has a control signal connected to pin `D4`. Wait `20` microseconds
for the sensor to detect something, then read the sensor value on pin `A4`.

```blocks
pins.D4.digitalWrite(true)
control.waitMicros(20)
let temperature = pins.A4.analogRead()
```

## #seealso