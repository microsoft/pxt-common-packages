# is Connected

Check a player's connected state in the game.

```sig
mp.isConnected(mp.playerSelector(mp.PlayerNumber.One))
```

## Parameters

* **player**: the player to check the connected state for.

## Returns

* a [boolean](/types/boolean) value for the state of the connected state of the player, `true` for connected and `false` for disconnected.

## Example #example

If `player 2` is no longer connected to the game, let `player 1` win by default.

```blocks
let pressCount = 0
game.onUpdateInterval(10000, function () {
    if (mp.isConnected(mp.playerSelector(mp.PlayerNumber.Two))) {
        mp.gameOverPlayerWin(mp.playerSelector(mp.PlayerNumber.One))
    }
})
```

## See also #seealso

[get player state](/reference/multiplayer/get-player-state)

```package
multiplayer
```