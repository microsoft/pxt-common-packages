# all Players

Get all players in the multiplayer game list.

```sig
mp.allPlayers()
```

If you want to access the player list for all of the players in the game, you can get the entire list of players in an array.

## Returns

* a [Player](/types/player) list for all of the players in the multiplayer game.

## Example #example

Find all the players that have a score greater than `20` and give them a bonus of `5` points.

```blocks
for (let player of mp.allPlayers()) {
    if (mp.getPlayerState(player, MultiplayerState.score) > 20) {
        mp.changePlayerStateBy(player, MultiplayerState.score, 5)
    }
}
```

## See also #seealso

[player selector](/reference/multiplayer/player-selector),
[get player by number](/reference/multiplayer/get-player-by-number)

```package
multiplayer
```