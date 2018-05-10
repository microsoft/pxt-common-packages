# life

Get the game player's life count.

```sig
info.life()
```

Your program has a life counter which you can set to record the number of lives remaining for a player in your game.

## Returns

* a [number](/types/number) that is the current life count.

## Example #example

Give the player a bonus of `1000` points if they reach `9` lives.

```blocks
let giveBonus = true

if (info.life() > 8) {
    if (giveBonus) {
        info.changeScoreBy(1000)
        giveBonus = false
    }
}
```

## See also #seealso

[set life](/reference/info/set-life),
[change life by](/reference/info/change-life-by)