# place

Move a sprite to the center of a selected tile.

```sig
tiles.getTileLocation(0, 0).place(null)
```

You a can place a sprite directly on a tile. If you have a [tile](/types/tile) location from the tilemap, just use **place** to put a sprite on top of it.

## Parameters

* **sprite**: the sprite to move onto the tile.

## Example #example

Make a tilemap with several different tiles. Create a circle sprite. Choose the tile at position (1, 1) in the tilemap and place the sprite over it.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let mySprite: Sprite = null
// TODO tiles.setTilemap(tiles.createTilemap(null, 0, 8 ** 8, 9)); 
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
let tileDock = tiles.getTileLocation(1, 1)
tileDock.place(mySprite)
```

## See also #seealso

[get tile location](/reference/tiles/get-tile-location)