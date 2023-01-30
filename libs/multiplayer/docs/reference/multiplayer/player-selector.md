# player Selector

Get a game Player using a player selector.

```sig
mp.playerSelector(mp.PlayerNumber.One)
```

Players in a multiplayer game are represented by the [Player](/types/player) game object. Player objects are usually referenced using a player selector. The selectors are named as a player number, like `player 1`, `player 2`, etc. To use many of the multiplayer game blocks, you need a selector to specify which player or players you're using with the block.

## Parameters

* **player**: a [Player](/types/player) to get using the selector.

## Returns

* the [Player](/types/player) chosen by the selector in **player**.

## Example #example

Set a character sprite for the player selected by ``||mp:player 2||``.

```blocks
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img`
    . . . . f f f f f . . . . . . . 
    . . . f e e e e e f . . . . . . 
    . . f d d d d e e e f . . . . . 
    . c d f d d f d e e f f . . . . 
    . c d f d d f d e e d d f . . . 
    c d e e d d d d e e b d c . . . 
    c d d d d c d d e e b d c . . . 
    c c c c c d d e e e f c . . . . 
    . f d d d d e e e f f . . . . . 
    . . f f f f f e e e e f . . . . 
    . . . . f f e e e e e e f . f f 
    . . . f e e f e e f e e f . e f 
    . . f e e f e e f e e e f . e f 
    . f b d f d b f b b f e f f e f 
    . f d d f d d f d d b e f f f f 
    . . f f f f f f f f f f f f f . 
    `, SpriteKind.Player))
```

## See also #seealso

[get player by number](/reference/multiplayer/get-player-by-number),
[get player by index](/reference/multiplayer/get-player-by-index)

```package
multiplayer
```