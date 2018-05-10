# set Tile

Add an image tile to the set of tiles in the scene.

```sig
scene.setTile(0, null)
```

A tile is an [image](/types/image) that is added to the scene for use in the scene's tile map. Using tiles, the scene can have the same image shown more than once at different locations.

Tiles are assigned an _index_ number which is the same value as a color number for images. The index number is placed at a location in the image layout for the tile map.

```block
scene.setTile(3, img`8`)
```

The block above has the color number `3` as an index for a solid color image tile. This tile is mapped to the scene by placing the value `3` into the tile map at each location where you want it to show in the scene.

```blocks
scene.setTileMap(img`
. . . .
. 3 3 .
6 3 3 6
9 9 9 9
`)
```

The tile assigned to `3` is set in four locations in the center of the map and will show in that part of the scene. The other numbers in the map are for other tiles added to the scene. If no tiles are set for a certain color number, the actual color itself is shown at that tile position.

## Parameters

* **index**: the color number used to identify this tile.
* **img**: the image to use for the tile.
* **collisions**: an optional [boolean](/types/boolean) value that allows collisions with the tile. A sprite will collide with the tile if set to `true`. Sprites will pass through if `false`. The default is `false`. 

## Example #example

```blocks
let solidTile = image.create(7, 7)
solidTile.fill(7)
scene.setTile(1, solidTile)
scene.setTile(2, img`
9 9 9 9 9 9 9
9 4 . . . 4 9
9 . 4 . 4 . 9
9 . . 4 . . 9
9 . 4 . 4 . 9
9 4 . . . 4 9
9 9 9 9 9 9 9
`)
scene.setTileMap(img`
1 1 1 1 1 1
1 2 2 2 2 1
1 2 2 2 2 1
1 1 1 1 1 1
`)
```

## See also #seealso

[tile map](/reference/scene/tile-map), [set tile map](/reference/scene/set-tile-map)