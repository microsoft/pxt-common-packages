# Tile

A tile is an image that is displayed as a rectangular portion of the game scene. The game scene is created with tiles placed at a row and column in a tilemap. The tilemap contains all the tiles shown in the scene.

## The tile type

A **tile** is a complex type that contains an [image](/types/image) and a position in a tilemap. The game scene has a collection of tiles and they are added to the scene using the [setTile](/reference/scene/set-tile) function. Tiles can also be set as a wall to keep sprites from passing through them.

## Setting tiles

You set tiles in the scene by creating an image and assigning it a tile index.

```blocks
scene.setTile(2, img`
a a a a a a a a
a a a a a a a a
a a a a a a a a
a a a a a a a a
a a a a a a a a
a a a a a a a a
a a a a a a a a
a a a a a a a a
`)
scene.setTile(3, img`
b b b b b b b b
b b b b b b b b
b b b b b b b b
b b b b b b b b
b b b b b b b b
b b b b b b b b
b b b b b b b b
b b b b b b b b
`)
```

The scene saves the images in a collection of tiles using a color number as an index. The tile index is used to place the tile in the map for the current scene.

```blocks
scene.setTileMap(img`
2 2 3 3 2 2 3 3 2 2
2 2 3 3 2 2 3 3 2 2
3 3 2 2 3 3 2 2 3 3
3 3 2 2 3 3 2 2 3 3
2 2 3 3 2 2 3 3 2 2
2 2 3 3 2 2 3 3 2 2
3 3 2 2 3 3 2 2 3 3
3 3 2 2 3 3 2 2 3 3
`)
```

The tilemap uses the color indexes in it's own mapping image but the actual tiles for those indexes are shown when the scene is displayed on the screen.

## Retrieving tiles

Tiles in the scene are returned to you with the **tile** type. The tiles are accessed by their location in the tilemap:

```blocks
let topTile: tiles.Tile = null
topTile = scene.getTile(4, 0)
```

You can also get a list of all the tiles in the tilemap that have the same color index:

```blocks
let tileList: tiles.Tile[] = []
tileList = scene.getTilesByType(4)
```

## See also

[set tile](/reference/scene/set-tile),
[set tilemap](/reference/scene/set-tilemap),
[get tile](/reference/scene/get-tile),
[get tiles by type](/reference/scene/get-tiles-by-type)
