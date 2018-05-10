# Tile Maps

Your game scene contains a tile map. A tile map is an arrangement (a pattern) of image tiles that fill up some of the scene. At first, the scene has an empty tile map and no tile pattern is displayed. To build up your scene, you need to make some tiles, add them to the scene, and then tell the scene where to place the tiles.

## Tiles

A tile is an image that is set to be used as part of a tile map. Using tiles, the scene can have the same image shown repeatedly at different locations.

```block
scene.setTile(1, img`
d d
d d
`)
scene.setTile(4, img`
5 c 5 c 5 c
c 5 c 5 5 5
5 5 5 c 5 c
c 5 c 5 c 5
5 c 5 5 5 c
c 5 c 5 c 5
`)
```

Tiles use a color number as their identifier. To map a tile into the scene, this number is set at some location in the tile map. Here the color number `1` is used to identify a tile with solid color.

```typescript
scene.setTile(1, img`
d d
d d
`)
```
### Tile sizes

Tiles can have any size and their sizes don't need to be the same. The scene might show different sized tiles by adjusting their dimensions to best display them so they keep their mapped order in the scene.

### Sprite collisions

A tile has a special feature to cause a _collision_ with a sprite. If a sprite is in motion and makes contact with a tile you've set for collision, then it can block or deflect the sprite from moving through it. You turn collisions ``on`` to block the sprites.

```block
scene.setTile(6, img`8`, true)
```

## Scene tile map

The tile map is a plan for where to put certain tiles. The map has rows and columns that contain a tile identifiers at each location. The tile map is actually an image layout where, instead of having pixels, the color numbers in the pixal locations are actually tile identifiers.

How does this work? To find out, let's make two small tiles and them to the scene.

```block
scene.setTile(1, img`
d d
d d
`)
scene.setTile(2, img`
a a
a a
`)
```

Now, we create a map to make a pattern with the tiles.

```block
scene.setTileMap(img`
1 2
2 1
`)
```

You see that the color numbers in the map match the color numbers set for the tiles. Tiles `1` and `2` are arranged as a checkered pattern in the map. Together the blocks look like this in code:

```typescript
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

After setting the tile map, the pattern will appear in the scene. 

```sim
let tile2: Image = null
let tile1: Image = null
tile1 = image.create(32, 32)
tile1.fill(13)
tile2 = image.create(32, 32)
tile2.fill(10)
scene.setTile(1, tile1)
scene.setTile(2, tile2)
scene.setTileMap(img`
1 1 2 2 
1 1 2 2
2 2 1 1
2 2 1 1
`)
```

### Unmatched color numbers

If there are color numbers in the tile map that don't match one of the tiles added to the scene, then the color number is not used as an identifer but just as a color fill. The tiling area for the unmatched tile just fills with the color for that number.

```block
scene.setTileMap(img`
7 7 7 7
7 1 2 7
7 2 1 7
7 7 7 7
`)
```

The image layout for the map with the unmatched color number `7` is this:

```typescript
scene.setTileMap(img`
7 7 7 7
7 1 2 7
7 2 1 7
7 7 7 7
`)
```

### Different tile sizes

When tiles with different sizes are in the tile map, the scene might make an area for each tile that is the size of the largest tile. If necessary, bigger tiles are partially overlapped or reduced to fit along with the smaller tiles.

Mixing these two sizes of tiles in the map:

```typescript
scene.setTile(1, img`
d d
d d
`)
scene.setTile(2, img`
4 4 4 4
4 4 4 4
4 4 4 4
4 4 4 4
`)
scene.setTileMap(img`
1 2
2 1
`)
```

Makes the scene display them like this:

```sim
let tile1 = image.create(32, 32)
tile1.fill(13)
let tile2 = image.create(64, 64)
tile2.fill(4)
scene.setTile(1, tile1)
scene.setTile(2, tile2)
scene.setTileMap(img`
1 2
2 1
`)
```
