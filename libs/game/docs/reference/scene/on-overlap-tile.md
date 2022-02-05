# on Overlap Tile

Run code when a sprite overlaps a tile.

```sig
scene.onOverlapTile(SpriteKind.Player, null, function (sprite, location) {})
```

You can detect when a moving sprite overlaps a tile in the tilemap. If your sprite moves across a tile, you can have some code that runs when that happens. You pick the sprite **kind** to check for.

When an overlap is detected by the sprite of the kind you asked for, it is given to you in the **sprite** parameter of **handler** along with overlapped tile's **location**.

A sprite hitting a wall is dectected when the outside edges of its image makes starts to overlap the tile.

## Parameters

* **kind**: the type of sprite to check for a overlap.
* **handler**: the code to run when the sprite overlaps a tile. The handler has these parameters passed to it:
>* **sprite**: the sprite that overlapped the tile.
>* **location**: the location of the tile that the sprite overlapped in the tilemap.

## Example #example

Create a tilemap with a section of tiles in the center of the scene. Set a sprite in motion and cause it to bounce on walls. When the sprite overlaps the tiles, make it trace a trail across the tiles.

```blocks
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile`, function (sprite, location) {
    sprite.startEffect(effects.trail, 100)
})
tiles.setTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . 1 1 2 2 2 2 2 2 1 1 . . . 
    . . . 1 2 2 2 2 2 2 2 2 1 . . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . 1 2 2 2 2 2 2 2 2 2 2 1 . . 
    . . . 1 2 2 2 2 2 2 2 2 1 . . . 
    . . . 1 1 2 2 2 2 2 2 1 1 . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.setBounceOnWall(true)
mySprite.vx = 80
mySprite.vy = 70
```

## See also #seealso

[get tile location](/reference/scene/get-tile-location),
[on hit wall](/reference/scene/on-hit-wall)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAADu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7g==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAxMDEwMDAwMDAwMDAwMDAwMDAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAxMDEwMDAwMDAwMDAwMDAwMDAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1"
        ],
        "displayName": "level1"
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```