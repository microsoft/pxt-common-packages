# get Player Sprite

Get the character sprite assigned to a Player.

```sig
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One))
```

## Parameters

* **player**: the [Player](/types/player) whose sprite will be returned.

## Returns

* the [sprite](/reference/types/sprite) that is assigned to the **player**.

## Example #example

Make a player sprite move across the screen. When the sprite reaches the edge of the screen, send the sprite back in the opposite direction and flip the image of the sprite.

```blocks
scene.setBackgroundColor(8)
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.One), sprites.create(img`
    .............ccfff..............
    ...........ccddbcf..............
    ..........ccddbbf...............
    ..........fccbbcf...............
    .....fffffccccccff.........ccc..
    ...ffbbbbbbbcbbbbcfff....ccbbc..
    ..fbbbbbbbbcbcbbbbcccff.cdbbc...
    ffbbbbbbffbbcbcbbbcccccfcdbbf...
    fbcbbb11ff1bcbbbbbcccccffbbf....
    fbbb11111111bbbbbcccccccbbcf....
    .fb11133cc11bbbbcccccccccccf....
    ..fccc31c111bbbcccccbdbffbbcf...
    ...fc13c111cbbbfcddddcc..fbbf...
    ....fccc111fbdbbccdcc.....fbbf..
    ........ccccfcdbbcc........fff..
    .............fffff..............
    `, SpriteKind.Player))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).vx = -20
game.onUpdateInterval(500, function () {
    if (mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).x < 0 || mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).x > scene.screenWidth()) {
        mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).image.flipX()
        mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).vx = mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).vx * -1
    } else {
        mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).startEffect(effects.bubbles, 100)
    }
})
```

## See also #seealso

[set player sprite](/reference/multiplayer/set-player-sprite),
[get player by sprite](/reference/multiplayer/get-player-by-sprite)

```package
multiplayer
```