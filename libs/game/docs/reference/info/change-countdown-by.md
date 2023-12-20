# change Countdown By

Change the current game countdown time up or down by this amount.

```sig
info.changeCountdownBy(0)
```

The current game countdown time amount is increased by adding the change value when it is greater than zero (positive). If the change number is less than zero (negative), the game countdown is reduced by the value of the change number.

## Parameters

* **value**: a [number](/types/number) seconds to change the game countdown by.

## Example #example

Reduce game countdown time by `3` seconds.

```blocks
info.changeCountdown(-3)
```

## See also #seealso

[countdown](/reference/info/score),
[on countdown end](/reference/info/on-countdown-end)