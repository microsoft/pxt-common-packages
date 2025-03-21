# get Player By Number

Get a game Player using a player number value.

```sig
mp.getPlayerByNumber(0)
```

Rather than using a [player selector](/reference/multiplayer/player-selector), a [Player](/types/player) is returned for a player **number**. Player numbers start from `1` and range to the maximum number of players (currently `4`).

## Parameters

* **number**: a player [number](/types/number).

## Returns

* the [Player](/types/player) which matches **number**.

## Example #example

Give `player 4` an extra `5` life points.

```blocks
mp.changePlayerStateBy(mp.getPlayerByNumber(4), MultiplayerState.life, 5)
```

## See also #seealso

[player selector](/reference/multiplayer/player-selector),
[get player by index](/reference/multiplayer/get-player-by-index)

```package
multiplayer
```