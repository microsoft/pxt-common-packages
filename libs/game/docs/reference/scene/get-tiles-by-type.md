# get Tiles By Type

Get a list of tiles in the tilemap that have the same color index.

```sig
scene.getTilesByType(0)
```

All the tiles in the tilemap with the chosen **index** are returned in an array of [tiles](/types/tile). You can use this array to change or replace the tiles as one group.

## Parameters

* **index**: the color index to the tiles to make a list for.

## Returns

* an [array](/types/array) of [tiles](/types/tile) from the tilemap that have the same color **index**.

## Example #example

Get a list of all the tiles in the center of the tilemap. Replace all of them with the tile type used for the border.

```blocks
scene.setTile(2, img`
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
a a a a a a a a a a a a a a a a 
`)
scene.setTileMap(img`
2 2 2 2 2 2 2 2 2 2 
2 8 . . . 8 . . . 2 
2 . 8 . 8 . 8 . 8 2 
2 . . 8 . . . 8 . 2 
2 . 8 . 8 . 8 . 8 2 
2 8 . . . 8 . . . 2 
2 2 2 2 2 2 2 2 2 2 
. . . . . . . . . . 
`)
for (let tile of scene.getTilesByType(8)) {
    scene.setTileAt(tile, 2)
    pause(500)
}
```

## See also #seealso

[get tile](/reference/scene/get-tile),
[set tile at](/reference/scene/set-tile-at)