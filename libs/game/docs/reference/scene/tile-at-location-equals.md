# tile At Location Equals

Check if a location in the tilemap contains the tile you're looking for.

```sig
tiles.tileAtLocationEquals(tiles.getTileLocation(0, 0), null)
```

## Parameters

* **location**: a [location](/reference/scene/location) in the tilemap.
* **tile**: an [image](/types/image) that matches the tile you're looking for.

## Returns

* a [boolean](/types/boolean) value that is `true` if the tile at **location** matches the **tile** you want to check for. If not, `false` is returned.

## Example #example

Make a tilemap with two columns of wall tiles with a different color for each.  Set a sprite in motion and cause it to bounce on walls. When the sprite contacts a tile, check to see what color the tile is.

```blocks
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    if (tiles.tileAtLocationEquals(location, assets.tile`myTile0`)) {
        mySprite.sayText("Blue", 500, false)
    } else if (tiles.tileAtLocationEquals(location, assets.tile`myTile1`)) {
        mySprite.sayText("Green", 500, false)
    } else {
        mySprite.startEffect(effects.fire, 200)
    }
})
let mySprite: Sprite = null
tiles.setTilemap(tilemap`level1`)
mySprite = sprites.create(img`
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
mySprite.vx = 40
mySprite.vy = 35
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
        "data": "hwQQABAAAACIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "tile2": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAyMDAwMDAwMDAwMDAwMDAwMDAxMDIwMDAwMDAwMDAwMDAwMDAwMDEwMjAwMDAwMDAwMDAwMDAwMDAwMTAyMDAwMDAwMDAwMDAwMDAwMDAxMDIwMDAwMDAwMDAwMDAwMDAwMDEwMjAwMDAwMDAwMDAwMDAwMDAwMTAyMDAwMDAwMDAwMDAwMDAwMDAxMDIwMDAwMDAwMDAwMDAwMDAwMDEwMjAwMDAwMDIwMDIwMDAwMDAyMDAyMDAwMDAwMjAwMjAwMDAwMDIwMDIwMDAwMDAyMDAyMDAwMDAwMjAwMjAwMDAwMDIwMDIwMDAwMDAyMA==",
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