# tile Image At Location

Get the image of the tile at a location in the tilemap.

```sig
tiles.tileImageAtLocation(tiles.getTileAtLocation(0, 0))
```

## Parameters

* **location**: the [location](/reference/tiles/location) object for the tile to return it's image.

## Returns

* the [image](/types/image) of the tile at the **location** in the tilemap.

## Example #example

Make a tilemap with some smiley face tiles. Create a new sprite using the image from one of the smiley face tiles. Have the new sprite move across the screen and back.

```blocks
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    sprite.startEffect(effects.bubbles, 500)
})
tiles.setCurrentTilemap(tilemap`level1`)
let tileImage = tiles.tileImageAtLocation(tiles.getTileLocation(0, 0))
let mySprite = sprites.create(tileImage, SpriteKind.Player)
mySprite.setBounceOnWall(true)
mySprite.vx = 50
```

## See also #seealso

[location](/reference/tiles/location)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAABERERERERERERERERERERERPT/RET/RERE9PRERERPRET0/0RERPRERERERERE9ERERERERET0RERERPRPRPRERERE9E9E9ERERERERET0RERERERERPRERPT/RERE9ERE9PRERERPRET0/0RE/0RERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDAwMTAwMDEwMDAxMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMTAwMDEwMDAxMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
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