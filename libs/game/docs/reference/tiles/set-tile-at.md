# set Tile At

Set a tile at a location in the tilemap.

```sig
tiles.setTileAt(tiles.getTileLocation(0, 0), null)
```

You can set a tile at a specific column and row in the tilemap using a tile location object. Specify a tile to set in the tilemap and a location for it.

## Parameters

* **loc**: a tile [location](/reference/tiles/location) in the tilemap.
* **tile**: the to set in the tilemap.

## Example #example

Create an empty tilemap and a solid color tile. Set the solid color tile at different places in the tilemap and replace its previous location with a transparent tile.

```blocks
tiles.setTilemap(tilemap`level1`)
let spot = tiles.getTileLocation(0, 0)
forever(function () {
    tiles.setTileAt(spot, assets.tile`transparency16`)
    spot = tiles.getTileLocation(randint(0, 9), randint(0, 6))
    tiles.setTileAt(spot, assets.tile`myTile`)
    pause(1000)
})
```

## See also #seealso

[get tile location](/reference/tiles/get-tile-location),
[place on tile](/reference/tiles/place-on-tile)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
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