# score

Get the current game score for the player.

```sig
info.score()
```

Your program has a score counter which you can set to record the current score for a game player.

## Returns

* a [number](/types/number) that is the current game score for the player.

## Example #example

Add `20` to the life count when the player reaches `10000` points.

### Single player

```blocks
let giveLives = true

if (info.score() > 9999) {
    if (giveLives) {
        info.changeLifeBy(20)
        giveLives = false
    }
}
```

### Multiplayer

```blocks
let giveLives = true

if (info.player2.score() > 9999) {
    if (giveLives) {
        info.player2.changeLifeBy(20)
        giveLives = false
    }
}
```

## See also #seealso

[set score](/reference/info/set-score),
[change score by](/reference/info/change-score-by)