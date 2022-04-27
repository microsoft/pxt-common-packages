# on Hit Wall

Run code when a sprite contacts a wall tile.

```sig
scene.onHitWall(SpriteKind.Player, function (sprite, location) { })
```

You can detect when a moving sprite contacts a wall tile in the tilemap. If your sprite touches a tile that is set as a wall, you can have some code that runs when that happens. You pick the sprite **kind** to check for.

When a wall hit is detected by the sprite of the kind you asked for, it is given to you in the **sprite** parameter of **handler** along with contacted tile's **location**.

A sprite hitting a wall is dectected when the outside edges of its image makes contact with the tile. If a sprite has it's ``ghost`` flag set, any contact with the wall tile isn't noticed.

## Parameters

* **kind**: the type of sprite to check for a wall hit.
* **handler**: the code to run when the sprite makes contact. The handler has these parameters passed to it:
>* **sprite**: the sprite that hit the wall tile.
>* **location**: the location of the wall the sprite contacted in the tilemap.

## Example #example

Create a tilemap with wall tiles surrounding the sides of the scene. Set a sprite in motion and cause it to bounce on wall tiles. When the sprite contacts the wall tiles, make a short fire effect on the sprite.

```blocks
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    sprite.startEffect(effects.fire, 200)
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
[set wall at](/reference/scene/set-wall-at)

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
        "data": "MTAwYTAwMDgwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAxMDEwMDAwMDAwMDAwMDAwMDAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEyMjIyMjIyMjIyMDIwMDAwMDAyMDAyMDAwMDAwMjAwMjAwMDAwMDIwMDIwMDAwMDAyMDAyMDAwMDAwMjAwMjAwMDAwMDIwMjIyMjIyMjIyMg==",
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