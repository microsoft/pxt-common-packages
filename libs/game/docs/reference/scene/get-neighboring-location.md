# get Neighboring Location

Get the location of a tile next to this one.

```sig
tiles.getTileLocation(0, 0).getNeighboringLocation(CollisionDirection.Top)
```

A neighboring tile is one that is immediately to the `left`, `right`, `top`, or `bottom` side of the current tile. You can specify the side of the neighboring tile you want the location for.

## Parameters

* **direction**: the direction side for the neighbor tile from this tile. The directions to choose from are `left`, `right`, `top`, or `bottom`.

## Returns

* a [location](/reference/scene/location) object for the neighbor tile.

## Example #example

Rotate a donut sprite around adjacent tiles in a tilemap.

```blocks
let nextSpot: tiles.Location = null
let rotation = 0
tiles.setCurrentTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    . . . . . . b b b b a a . . . . 
    . . . . b b d d d 3 3 3 a a . . 
    . . . b d d d 3 3 3 3 3 3 a a . 
    . . b d d 3 3 3 3 3 3 3 3 3 a . 
    . b 3 d 3 3 3 3 3 b 3 3 3 3 a b 
    . b 3 3 3 3 3 a a 3 3 3 3 3 a b 
    b 3 3 3 3 3 a a 3 3 3 3 d a 4 b 
    b 3 3 3 3 b a 3 3 3 3 3 d a 4 b 
    b 3 3 3 3 3 3 3 3 3 3 d a 4 4 e 
    a 3 3 3 3 3 3 3 3 3 d a 4 4 4 e 
    a 3 3 3 3 3 3 3 d d a 4 4 4 e . 
    a a 3 3 3 d d d a a 4 4 4 e e . 
    . e a a a a a a 4 4 4 4 e e . . 
    . . e e b b 4 4 4 4 b e e . . . 
    . . . e e e e e e e e . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.x = mySprite.x - mySprite.width
game.onUpdateInterval(1000, function () {
    if (rotation == 0) {
        nextSpot = mySprite.tilemapLocation().getNeighboringLocation(CollisionDirection.Right)
    } else if (rotation == 1) {
        nextSpot = mySprite.tilemapLocation().getNeighboringLocation(CollisionDirection.Bottom)
    } else if (rotation == 2) {
        nextSpot = mySprite.tilemapLocation().getNeighboringLocation(CollisionDirection.Left)
    } else {
        nextSpot = mySprite.tilemapLocation().getNeighboringLocation(CollisionDirection.Top)
    }
    mySprite.setPosition(nextSpot.x, nextSpot.y)
    rotation += 1
    if (rotation > 3) {
        rotation = 0
    }
})
```

## See also #seealso

[get tile location](/reference/scene/get-tile-location)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "tile2": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "tile3": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "tile4": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile2"
    },
    "tile5": {
        "data": "hwQQABAAAACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile3"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMzAyMDMwMjAzMDIwMzAyMDEwMTAyMDMwMjAzMDIwMzAyMDMwMTAxMDMwMjAzMDIwMzAyMDMwMjAxMDEwMjAzMDIwMzAyMDMwMjAzMDEwMTAzMDIwMzAyMDMwMjAzMDIwMTAxMDIwMzAyMDMwMjAzMDIwMzAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile3",
            "myTiles.tile4",
            "myTiles.tile5"
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