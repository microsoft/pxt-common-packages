# place On Random Tile

Move a sprite's position to the center of a random tile in the scene.

```sig
scene.placeOnRandomTile(null, 0)
```

You a can make a sprite to locate itself right on top of a random tile in the tile map. Use the color number of type of tile to select for the sprite to locate on one of them.


## Parameters

* **sprite**: the sprite to move onto the tile.
* **color**: the color [number](/types/number) of a tile to randomly select.

## Example #example

Make a tilemap with several different tiles. Create a round shaped sprite. Ramdomly place the sprite on a tile with color number `8`.

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
scene.placeOnRandomTile(mySprite, 8)
```

## See also #seealso

[get tile](/reference/scene/get-tile)