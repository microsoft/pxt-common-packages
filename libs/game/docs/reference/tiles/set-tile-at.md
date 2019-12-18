# set Tile At

Set a location in the tilemap to a specific tile.

```sig
tiles.setTileAt(null, 0)
```

This block allows you to place a tile [image](/types/image) at a specific [tile](/types/tile) location in the map. The tile map will be updated with the new image.

## Parameters

* **tile**: the [tile](/types/tile) location.
* **image**: the tile [image](/types/image) to place in this location.

## Example #example

Make a scene using a tilemap with border tiles and two tiles in the center. Replace the tiles in the center with the ones used for the border.

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
pause(1000)
tiles.setTileAt(tiles.getTileLocation(4, 3), image)
pause(1000)
tiles.setTileAt(tiles.getTileLocation(5, 3), image)
```

## See also #seealso

[set tile](/reference/tiles/set-tile), [get tile location](/reference/tiles/get-tile-location)