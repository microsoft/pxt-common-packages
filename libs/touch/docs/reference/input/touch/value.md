# value

Get the current touch detected value remembered by a pin.

```sig
input.touchA1.value();
```
A pin detects that it was touched by measuring some amount of electrical charge placed on it by you touching it. This amount is measure using a value between `0` and `1023`. If you touched the pin very briefly, the value is small. If you touch it for a longer time, the value is greater.

## Returns

* a [number](/types/number) that is between `0` (not touched) and `1023` touched for a long time.

## Example #example

Measure the touch values at pin **A1**. If they are greater than `512`, then log
them to the console.

```blocks
let touchValue = 0
forever(function () {
    touchValue = input.touchA1.value()
    if ( touchValue> 512) {
        console.logValue("touch-value", touchValue) {
    }
    pause(500)
})
```

## See also #seealso

[set threshold](/reference/input/touch/set-threshold)

```package
touch
```