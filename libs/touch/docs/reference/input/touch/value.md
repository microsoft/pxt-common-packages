# value

Get the current touch detected value remembered by a pin.

```sig
input.pinA1.value();
```
A pin detects that it was touched by measuring some amount of electrical charge placed on it by you touching it. This amount is measure using a value between `0` and `1023`. If you touched the pin very briefly, the value is small. If you touch it for a longer time, the value is greater.

## Returns

* a [number](/types/number) that is between `0` (not touched) and `1023` touched for a long time.

## Example

Measure the touch values at pin **A2**. If they are greater than `512`, then flash green light on the pixels.

```blocks
input.pinA2.setThreshold(100)
loops.forever(function () {
    if (input.pinA2.value() > 512) {
        light.setAll(Colors.Green)
        loops.pause(100)
        light.setAll(Colors.Black)
    }
    loops.pause(500)
})
```

## See also

[set threshold](/reference/input/touch/set-threshold)

```package
touch
```