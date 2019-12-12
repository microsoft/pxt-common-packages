# set Tile Map

Arrange image tiles as a pattern in the scene.

```sig
scene.setTilemap(null)
```

Your game scene contains a [tile map](/reference/scene/tile-map). A tile map is an arrangement (a pattern) of image tiles that fill up some of the scene. At first, the scene has an empty tile map and no tile pattern is displayed. To build up your scene, you need to use the tile map editor to make some tiles and place them in the scene.

The tile map uses an image layout to map the tiles for the scene. The numbers in the image are identifiers (an index) for image tiles that were added to the scene. Tile indexes are placed at various locations in the map to create what's displayed in the scene.

## Parameters

* **tilemap**: an [image](/types/image) where the pixels contain indexes of tile images to show in the scene.

## Example #example
// TODO example

## See also #seealso

[tile map](/reference/scene/tile-map)
