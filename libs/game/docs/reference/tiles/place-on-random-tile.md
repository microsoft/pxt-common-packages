# place On Random Tile

Move a sprite's position to the center of a random tile in the scene.

```sig
tiles.placeOnRandomTile(null, 0)
```

You a can place a sprite on top of a random tile in the tile map. Use the tile image to select which group of tiles the sprite can be placed on.


## Parameters

* **sprite**: the sprite to move onto the tile.
* **image**: the tile [image](/types/image). The sprite will be randomly placed on a tile that matches this image

## Example #example

Make a tilemap with several different tiles. Create a circle sprite. Randomly place the sprite on a tile with color number `8`.

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
tiles.placeOnRandomTile(mySprite, 8)
```

## See also #seealso

[get tile location](/reference/tiles/get-tile-location)