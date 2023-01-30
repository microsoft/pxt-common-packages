# get Player By Index

Get a Player from the multiplayer game list using an index value.

```sig
mp.getPlayerByIndex(0)
```

You can get a [Player](/types/player) object from the multiplayer using an index value for a location in the list. Index values start at `0` for the first list location and range to the maximum number of players minus `1` (currently `4` players maximum so, the maximum list index is `4 - 1` = `3`).

## Parameters

* **index**: a [number](/types/number) that is the index of the Player in the multiplayer list.

## Returns

* the [Player](/types/player) in the multiplayer list at location **index**.

## Example #example

Find all the players that have a score greater than `20` and give them a bonus of `5` points.

```blocks
let player: mp.Player = null
for (let index = 0; index <= 3; index++) {
    player = mp.getPlayerByIndex(index)
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