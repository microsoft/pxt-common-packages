# get Tiles By Type

Get a list of locations in the tilemap that have the same tile image.

```sig
tiles.getTilesByType(0)
```

All the locations in the tilemap with the chosen **image** are returned in an array of [tiles](/types/tile). You can use this array to change or replace the tiles as one group.

## Parameters

* **image**: the chosen tile image. This function returns all locations with this image

## Returns

* an [array](/types/array) of [tiles](/types/tile) from the tilemap that have the same  **image**.

## Example #example

Get a list of all the tiles in the center of the tilemap. Replace all of them with the tile type used for the border.

```blocks
let image = img`
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
`;
// TODO tiles.setTilemap(tiles.createTilemap(null, 0, 8 ** 8, 9)); 
for (let tile of tiles.getTilesByType(image)) {
    tiles.setTileAt(tile, image)
    pause(500)
}
```

## See also #seealso

[get tile location](/reference/tiles/get-tile-location),
[set tile at](/reference/tiles/set-tile-at)