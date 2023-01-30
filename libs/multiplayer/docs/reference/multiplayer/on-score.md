# on Score

Run some code when a player's score reaches a given value.

```sig
mp.onScore(100, function (player) {})
```

## Parameters

* **score**: a [number](/types/number) that is the score value to trigger the event.
* **handler**: the code to run when any player's score reaches the value in **score**.

## Example #example

Reward each player that reaches a score of `100` with `1` more life point.

```blocks
mp.onScore(100, function (player) {
    mp.changePlayerStateBy(player, MultiplayerState.score, 1)
})
```

## See also #seealso

[on life zero](/reference/multiplayer/on-life-zero)

```package
multiplayer
```
