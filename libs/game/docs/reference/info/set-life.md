# set Life

Set the player life count to this amount.

```sig
info.setLife(0)
```

Your program has a life counter which you can set to record the number of lives remaining for a player in your game.

## Parameters

* **score**: a [number](/types/number) to set the life count to.

## Example #example

Set the player life count to `9` lives before starting the game.

### Single player

```blocks
info.setLife(9)
```

### Multiplayer

```blocks
info.player2.setLife(9)
```

## See also #seealso

[change life by](/reference/info/change-life-by)