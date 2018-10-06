# place

Move a sprite's position to the center of a tile in the scene.

```sig
scene.getTile(0, 0).place(null)
```

You a can make a sprite to locate itself right on top of a tile. If you have a [tile](/types/tile) object from the tilemap, just use **place** to put a sprite on top of it.

## Parameters

* **sprite**: the sprite to move onto the tile.

## Example #example

Make a tilemap with several different tiles. Create a round shaped sprite. Choose the tile at position (1, 1) in the tilemap and place the sprite over it.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let mySprite: Sprite = null
scene.setTileMap(img`
. . . . . . . . 3 . 
. 2 . . . . . . . . 
. . . . . 8 . . . . 
. . . . . . . b . . 
. . 8 . 6 . . . . . 
. . . . . . 4 . . . 
. a . . . . . . . . 
. . . . . . . . e . 
`)
mySprite = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . 7 7 7 7 7 7 . . . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . . . 7 7 7 7 7 7 . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Player)
pause(1000)
let tileDock = scene.getTile(1, 1)
tileDock.place(mySprite)
```

## See also #seealso

[get tile](/reference/scene/get-tile)