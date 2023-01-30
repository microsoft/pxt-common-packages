# set Player Indicators Visible

Make player sprite indicators visible or not visible.

```sig
mp.setPlayerIndicatorsVisible(true)
```

When set as visible, player indicators are displayed on the screen next to the player's character sprite. All active players will have an indicator shown.

## Paramters

* **visible**: a [boolean](/types/boolean) value that when set `true` all player's indicators are visible on the screen to every player. Otherwise, if set `false`, the indicators aren't displayed on any player's screen.

## Example #example

Set sprites for both `player 1` and `player 2`. Send them moving around the screen. Turn the visibility of the indicators on so that each player sprite is identified.

```blocks
mp.setPlayerIndicatorsVisible(true)
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
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setBounceOnWall(true)
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setVelocity(40, -30)
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . c c c c . . . . . . . . 
    . . c c 5 5 5 5 c c . . . . . . 
    . c 5 5 5 5 5 5 5 5 c . . . . . 
    c 5 5 5 5 5 1 f 5 5 5 c . . . . 
    c 5 5 5 5 5 f f 5 5 5 5 c . . . 
    c 5 5 5 5 5 5 5 5 5 5 5 c . . . 
    c c b b 1 b 5 5 5 5 5 5 d c . . 
    c 5 3 3 3 5 5 5 5 5 d d d c . . 
    . b 5 5 5 5 5 5 5 5 d d d c . . 
    . . c b b c 5 5 b d d d d c . . 
    . c b b c 5 5 b b d d d d c c c 
    . c c c c c c d d d d d d d d c 
    . . . c c c c d 5 5 b d d c c . 
    . . c b b c c c 5 5 b c c . . . 
    . . c c c c c d 5 5 c . . . . . 
    `, SpriteKind.Player))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two)).setBounceOnWall(true)
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two)).setVelocity(50, 40)
```

## See also #seealso

[set player sprite](/reference/multiplayer/set-player-sprite)

```package
multiplayer
```