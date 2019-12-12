# get Tile

Get a tile location from the tilemap.

```sig
tiles.getTile(0, 0)
```

## Parameters

* **col**: the column of the tile in the tilemap.
* **row**: the row of the tile in the tilemap.

## Returns

* a [tile](/types/tile) from a location in the tilemap.

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
tiles.setTileAt(tiles.getTile(4, 3), image)
pause(1000)
tiles.setTileAt(tiles.getTile(5, 3), image)
```

## See also #seealso

[get tiles by type](/reference/tiles/get-tiles-by-type),
[set tile at](/reference/tiles/set-tile-at)