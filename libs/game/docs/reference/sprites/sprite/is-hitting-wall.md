# is Hitting Wall

See if the sprite has contacted a wall tile or not.

```sig
sprites.create(null).isHittingTile(CollisionDirection.Left)
```

The function checks if the sprite is currently touching a wall tile on on of it's four sides. If the sprite is contacting the wall tile, then `true` is returned.

The sprite must be in motion (a velocity of ``vx`` or ``vy`` that isn't `0`) before the checking for a tile hit. Otherwise, `false` is returned even though the sprite is touching the wall tile.

## Parameters

* **direction**: the direction check for a wall collision: ``left``, ``right``, ``top``, or ``bottom``

## Returns

* a [boolean](/types/boolean) value that is `true` if the sprite is contacting a wall tile or `false` if isn't touching a wall tile.

## Example

Build a brick wall of tiles in the scene. Send a arrow sprite towards the wall. If the sprite hits the wall, send it back in the oppsite direction.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let flipImage: Image = null
let mySprite: Sprite = null
scene.setTile(2, img`
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 f 2 1 
1 2 2 f 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 f 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 f 2 2 2 f 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 f 2 2 2 2 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 f 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
`, true)
scene.setTileMap(img`
. . . . . . . . . . 
. 2 . . . . . . . . 
. 2 . . . . . . . . 
. 2 . . . . . . . . 
. 2 . . . . . . . . 
. 2 . . . . . . . . 
. 2 . . . . . . . . 
. . . . . . . . . . 
`)
flipImage = img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . 5 5 5 5 5 5 . . . . . 
. . . 5 5 5 5 5 5 5 . . . . . . 
. . 5 5 5 5 5 5 5 . . . . . . . 
. 5 5 5 5 5 5 5 . . . . . . . . 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
. 5 5 5 5 5 5 5 . . . . . . . . 
. . 5 5 5 5 5 5 5 . . . . . . . 
. . . 5 5 5 5 5 5 5 . . . . . . 
. . . . . 5 5 5 5 5 5 . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`
mySprite = sprites.create(flipImage, SpriteKind.Player)
mySprite.vx = -50
game.onUpdate(function () {
    if (mySprite.isHittingTile(CollisionDirection.Left)) {
        flipImage.flipX()
        mySprite.vx = mySprite.vx * -1
    }
})
```

## See also #seealso

[tile hit from](/reference/sprites/sprite/tile-hit-from),
[on hit tile](/reference/sprites/on-hit-tile)