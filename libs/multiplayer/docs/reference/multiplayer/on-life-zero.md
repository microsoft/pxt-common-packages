# on Life Zero

Run some code when a player's life points reach zero.

```sig
mp.onLifeZero(function (player) {})
```

## Parameters

* **handler**: the code to run when any player's life points reach the value of `0`.

## Example #example

Make the player's sprite put up an emergency message when their life points get to zero.

```blocks
mp.onLifeZero(function (player) {
    mp.getPlayerSprite(player).sayText("Medic, help!!!")
})
```
## See also #seealso

[on score](/reference/multiplayer/on-score)

```package
multiplayer
```
