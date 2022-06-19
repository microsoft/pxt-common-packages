# place On Tile

Move a sprite's position to the center of a tile location in the tilemap.

```sig
tiles.placeOnTile(null, tiles.getTileLocation(0, 0))
```

A sprite will locate itself on top of a tile in the tilemap using a tilemap location object. A location object contains a tile row value and a tile column value.

## Parameters

* **sprite**: the sprite to move onto the tile.
* **loc**: a tile location in the tilemap.

## Example #example

Make a grid tilemap with two tile colors. Create a round shaped sprite. Ramdomly place the sprite on a tile in the grid.

```blocks
tiles.setTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
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

forever(function () {
    tiles.placeOnTile(mySprite, tiles.getTileLocation(randint(0, 9), randint(0, 6)))
    pause(500)
})
```

## See also #seealso

[get tile location](/reference/scene/get-tile-location),
[place on random tile](/reference/scene/place-on-random-tile)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAADd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3Q==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "tile2": {
        "data": "hwQQABAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDIwMTAyMDEwMjAxMDIwMTAyMDIwMTAyMDEwMjAxMDIwMTAyMDEwMTAyMDEwMjAxMDIwMTAyMDEwMjAyMDEwMjAxMDIwMTAyMDEwMjAxMDEwMjAxMDIwMTAyMDEwMjAxMDIwMjAxMDIwMTAyMDEwMjAxMDIwMTAxMDIwMTAyMDEwMjAxMDIwMTAyMDIwMTAyMDEwMjAxMDIwMTAyMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1",
            "myTiles.tile2"
        ],
        "displayName": "level1"
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```