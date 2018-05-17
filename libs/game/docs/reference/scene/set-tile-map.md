# set Tile Map

Arrange image tiles as a pattern in the scene.

```sig
scene.setTileMap(null)
```

Your game scene contains a [tile map](/reference/tile-maps). A tile map is an arrangement (a pattern) of image tiles that fill up some of the scene. At first, the scene has an empty tile map and no tile pattern is displayed. To build up your scene, you need to make some tiles, add them to the scene, and then tell the scene where to place the tiles.

The tile map uses an image layout to map the tiles for the scene. The color numbers in the image are identifiers (an index) for image tiles that were added to the scene. Tile indexes are placed at various locations in the map to create what's displayed in the scene. If there's no tile set with an index to match a color number in the map, the actual color for that number is filled into the scene at that tile location instead.

Tiles are placed in the scene based on their position in the in the map. Here's a solid color tile with an index of `3`:

```block
scene.setTile(3, img`7`)
```

Four of these tiles are set into the center of the map using the color number as an index to match them:

```typescript
scene.setTileMap(img`
. a . 9
. 3 3 2
2 3 3 .
9 . a .
`)
```

So, instead of showing the color of `3` at that location in the scene, the tile image assigned to the index of  `3` is shown there.

## Parameters

* **map**: an [image](/types/image) where the pixels contain indexes of tile images to show in the scene.

## Example #example

### Checker map #ex1

Make a small checkered tile map with two solid color tiles.

```blocks
scene.setTile(1, img`
d d
d d
`)
scene.setTile(2, img`
a a
a a
`)
scene.setTileMap(img`
1 2
2 1
`)
```
### Unmatched color numbers #ex2

Make tile map with unmatched color numbers and different size tiles.

```blocks
scene.setTile(1, img`
d d d d
d d b b
d d b b
b b b b
`)
scene.setTile(2, img`
a a
a a
`)
scene.setTileMap(img`
1 2 7
2 1 7
7 7 7
`)
```

## See also #seealso

[tile map](/reference/scene/tile-map),
[set tile](/reference/scene/set-tile)