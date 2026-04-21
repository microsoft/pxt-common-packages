# threshold

Get the current threshold set for a touch pin.

```sig
input.touchA1.threshold()
```

Pins (or pads) on a board used to detect a touch are measured to see how much electrical charge is on them. This measurement happens over a short period of time while a charge builds up when you touch it. To control the amount of charge it takes for the touch circuit to say that a touch happen, you set the touch threshold.

Setting a higher threshold value makes it take longer for a touch event to happen. If you want a touch event to require you to stay on the pin for a while, then set the value to something high. Quick taps on the pin will signal a touch with a lower threshold value.

## Returns

* a [number](/types/number) that is the currently set threshold (charge amount) needed to detect that a pin was touched. This is a value between `0` and `1023`.

## Example #example

Set the touch threshold to `1000` if it's set to a lower value.

```blocks
if (input.touchA1.threshold()) {
    input.touchA1.setThreshold(1000)
}
```

## See also #seealso

[set threshold](/reference/input/touch/set-threshold)

```package
touch
```
