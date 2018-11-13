# set Tile At

Change a tile in the tilemap to another tile.

```sig
scene.setTileAt(null, 0)
```

A tile from the tile map has the [tile](/types/tile) type. You can change that tile by using it's object type, [tile](/types/tile), and the index of a different tile. The tile map is changed to have the new tile take the position in the tilemap where this one was.

## Parameters

* **tile**: the [tile](/types/tile) object to be replaced.
* **index**: the color index of the tile to replace the previous one.

## Example #example

Make a scene using a tilemap with border tiles and two tiles in the center. Replace the tiles in the center with the ones used for the border.

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
2 . . . . . . . . 2 
2 . . . . . . . . 2 
2 . . . 1 1 . . . 2 
2 . . . . . . . . 2 
2 . . . . . . . . 2 
2 2 2 2 2 2 2 2 2 2 
. . . . . . . . . . 
`)
pause(1000)
scene.setTileAt(scene.getTile(4, 3), 2)
pause(1000)
scene.setTileAt(scene.getTile(5, 3), 2)
```

## See also #seealso

[set tile](/reference/scene/set-tile), [get tile](/reference/scene/get-tile)