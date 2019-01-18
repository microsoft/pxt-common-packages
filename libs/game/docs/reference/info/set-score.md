# set Score

Set the game score for a player to this amount.

```sig
info.setScore(0)
```

Your program has a score counter which you can set to record the current score for a game player.

## Parameters

* **score**: a [number](/types/number) to set the current score to.

## Example #example

Give the player `110` points to before starting the game.

### Single player

```blocks
info.setScore(110)
```

### Multiplayer

```blocks
info.player2.setScore(110)
```

## See also #seealso

[change score by](/reference/info/change-score-by),
[score](/reference/info/score)