# set Wall At

Set a tile as a wall tile in the tilemap.

```sig
tiles.setWallAt(tiles.getTileLocation(0, 0), false)
```

Wall tiles create a barrier for sprites so that they can't pass through tilemap at the tile location. You can set a tile location in the tilemap as a wall or turn it back to a regular tile.

## Parameters

* **loc**: a tile [location](/reference/tiles/location) in the tilemap.
* **on**: a [boolean](/types/boolean) value to set the tile location be a wall tile if `true` or a regular tile if `false`.

## Example #example

Make a column of tiles from top to bottom of the screen. Set a sprite in motion and set it to bounce on walls. Every `5` seconds, set the tiles  in the column to be wall tiles or regular tiles.

```blocks
let isWall = false
tiles.setTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . 1 1 2 2 2 2 2 2 1 1 . . . 
    . . . 1 2 2 2 2 2 2 2 2 1 . . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . . 1 2 2 2 2 2 2 2 2 1 . . . 
    . . . 1 1 2 2 2 2 2 2 1 1 . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.setBounceOnWall(true)
mySprite.vx = 80
mySprite.vy = 70
game.onUpdateInterval(5000, function () {
    isWall = !(isWall)
    for (let wallTile of tiles.getTilesByType(assets.tile`myTile`)) {
        tiles.setWallAt(wallTile, isWall)
    }
})
```

## See also #seealso

[get tile location](/reference/tiles/get-tile-location),
[on hit wall](/reference/scene/on-hit-wall)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAADu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7g==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1"
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