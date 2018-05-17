# score

Get the current game score value.

```sig
info.score()
```

Your program has a score counter which you can set to record the current score for your game code.

## Returns

* a [number](/types/number) that is the current game score.

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

[set score](/reference/info/set-score),
[change score by](/reference/info/change-score-by)