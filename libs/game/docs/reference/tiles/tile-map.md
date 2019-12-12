# Tile Map

Your game scene contains a tile map. A tile map is an arrangement (a pattern) of image tiles that fill up some or all of the scene, and a wall image to specify where the walls in your game are. At first, the scene has an empty tile map and no tile pattern is displayed. To build up your scene, you need to use the tile map editor to make some tiles and place them in the scene.

## Tiles

A tile is an image that is set to be used as part of a tile map. Using tiles, the scene can have the same image shown repeatedly at different locations. Using the tilemap editor, you can draw tiles the same way you would in the sprite editor.

### Tile sizes

Tiles can have any size, but all tiles in the game must have the same size.

### Walls

The scene also contains walls, which a sprite cannot pass through. You can draw the walls onto your scene by selecting the wall icon in the tilemap editor, and drawing onto the canvas. The wall layer can be toggled on and off in the editor using the switch in the top right corner.

## Scene tile map

The tile map is a plan for where to put certain tiles. The map has rows and columns that contain a tile image at each location. You can think of the tile map as an image layout where, instead of having pixels, the numbers in the pixal locations are actually tile indexes.

## Example
// TODO fill in example

## See also #seealso

[set tile map](/reference/scene/set-tile-map)