# score

Get the highest score recored for the game.

```sig
info.life(0)
```

The highest score recorded by your game program is remembered. So, you can find out what the player's best score was for the game.

## Returns

* a [number](/types/number) that is the highest game score.

## Example #example

Add `9` to the life count if the player had a high score of  `100000` points.

```blocks
let lifeBonus = true

if (info.score() >= 100000) {
    if (lifeBonus) {
        info.changeLifeBy(9)
        lifeBonus = false
    }
}
```

## See also #seealso

[set score](/reference/info/set-score),
[change score by](/reference/info/change-score-by),
[score](/reference/info/score)