# get Player State

Get the value of a Player state item.

```sig
mp.getPlayerState(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score)
```

Information like the player's score and life count is contained with the [Player](/types/player) game object. The Player object has the ``||mp:score||`` and ``||mp:life||`` state items already added.

## Parameters

* **player**: the [Player](/types/player) to get a state item value for.
* **state**: the [state item](/reference/multiplayer/multiplayer-state) to get a **value** for, such as `score` or `life`.

## Returns

* **value**: a [number](/types/number) which is the value for **state**.

## Example #example

Get the ``||mp:number||`` property  for `player 3`.

```blocks
scene.setBackgroundColor(10)
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.One), sprites.create(img`
    . . . . . f f f f f . . . . . . 
    . . . . f e e e e e f . . . . . 
    . . . f d d d d d d e f . . . . 
    . . f d f f d d f f d f f . . . 
    . c d d d e e d d d d e d f . . 
    . c d c d d d d c d d e f f . . 
    . c d d c c c c d d d e f f f f 
    . . c d d d d d d d e f f b d f 
    . . . c d d d d e e f f f d d f 
    . . . . f f f e e f e e e f f f 
    . . . . f e e e e e e e f f f . 
    . . . f e e e e e e f f f e f . 
    . . f f e e e e f f f f f e f . 
    . f b d f e e f b b f f f e f . 
    . f d d f f f f d d b f f f f . 
    . f f f f f f f f f f f f f . . 
    `, SpriteKind.Player))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).sayText("I'm player " + mp.getPlayerProperty(mp.playerSelector(mp.PlayerNumber.One), mp.PlayerProperty.Number))
```

## See also #seealso

[set player state](/refernece/multiplayer/set-player-state),
[change player state by](/reference/multiplayer/change-player-state-by),
[get player property](/reference/multiplayer/get-player-property)

```package
multiplayer
```