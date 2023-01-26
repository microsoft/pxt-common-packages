# change Player State By

Change a player state value by some amount.

```sig
mp.changePlayerStateBy(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 0)
```

## Parameters

* **player**: the player to change the a **state** value for.
* **state**: the player state property to change.
* **delta**: the amount to change the **state** value by.

## See also

[set player state](/reference/multiplayer/set-player-state)

```package
multiplayer
```