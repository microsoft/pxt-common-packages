# move With Buttons

Add movement control to a player sprite with the controller arrow buttons.

```sig
mp.moveWithButtons(mp.playerSelector(mp.PlayerNumber.One))
```

A player's sprite will move vertically or horizontally with the controller's arrow buttons. The horizontal `vx` and vertical `vy` values a speeds (pixels per second) at which the sprite will move when an arrow button is pressed. If no values are set for `vx` and `vy`, the default value of `100` is used.

## Parameters

* **player**: the player to set movement control for.
* **vx**: an optional velocity (speed) to move the player in the left or right direction. The default value is `100`.
* **vy**: an optional velocity (speed) to move the player the up or down direction. The default value is `100`.

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

[is button pressed](/reference/multiplayer/is-button-pressed)

```package
multiplayer
```