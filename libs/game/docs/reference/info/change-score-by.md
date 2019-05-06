# change Score By

Change the player score up or down by this amount.

```sig
info.changeScoreBy(0)
```

The total score amount is increased by adding the change value when it is greater than zero (positive). If the change number is less than zero (negative), the total score is reduced by the value of the change number.

## Parameters

* **value**: a [number](/types/number) to set the current score to.

## Example #example

Give the player a bonus of `1000` points if they reach `9` lives.

### Single player

```blocks
let giveBonus = true

if (info.life() > 8) {
    if (giveBonus) {
        info.changeScoreBy(1000)
        giveBonus = false
    }
}
```

### Multiplayer

```blocks
let giveBonus = true

if (info.player2.life() > 8) {
    if (giveBonus) {
        info.player2.changeScoreBy(1000)
        giveBonus = false
    }
}
```

## See also #seealso

[set score](/reference/info/set-score),
[score](/reference/info/score)
