# change Life By

Change the number of lives for the game player up or down by this amount.

```sig
info.changeLifeBy(0)
```

The number of lives is increased by adding the change value when it is greater than zero (positive). If the change number is less than zero (negative), the life count is reduced by the value of the change number.

## Parameters

* **value**: a [number](/types/number) to change the life count by. Positive numbers add life and negative numbers reduce life.

## Example #example

Add `20` to the life count when the player reaches `10000` points.

```blocks
let giveLives = true

if (info.score() > 9999) {
    if (giveLives) {
        info.changeLifeBy(20)
        giveLives = false
    }
}
```

## See also #seealso

[set life](/reference/info/set-life),
[life](/reference/info/life)