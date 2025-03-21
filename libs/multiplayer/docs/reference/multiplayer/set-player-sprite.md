# set Player Sprite

Assign a character sprite to a player.

```sig
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img``))
```

The sprite that is set for a [Player](/types/player) is moved when controller buttons are enabled for the Player. Also, player [indicators]() are displayed with the sprite.

## Parameters

* **player**: the [Player](/types/player) to assing a sprite to.
* **sprite**: the sprite to set as the character sprite for **player**.

## Example #example

Set a character sprite for `player 2` and make it move with the controller buttons.

```blocks
scene.setBackgroundColor(10)
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img`
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
mp.moveWithButtons(mp.playerSelector(mp.PlayerNumber.Two))
```

## See also #seealso

[get player sprite](/reference/multiplayer/get-player-sprite),
[set player indicators visible](/reference/multiplayer/set-player-indicators-visible)

```package
multiplayer
```