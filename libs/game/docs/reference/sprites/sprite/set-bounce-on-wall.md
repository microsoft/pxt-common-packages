# set Bounce On Wall

Set a sprite to bounce away from a wall tiles or the edge of the screen.

```sig
sprites.create(null).setBounceOnWall(false)
```

Setting a sprite to bounce on a wall makes the sprite to bounce away from a wall tile when it contacts it. The sprite will also bounce back from the edge of the scene's tilemap. If there is no tilemap defined for the scene, the sprite will bounce off the edges of screen and remain in the screen view.

## Parameters

* **on**: a [boolean](/types/boolean) value to set the ``bounce on wall`` flag for the sprite. A ``true`` value means set to **ON** and a ``false`` value means **OFF**.

## Example

### Bounce on wall tiles

Set a sprite to bounce away from a wall of tiles.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setBounceOnWall(true)
tiles.setTilemap(tilemap`level`)
mySprite.vx = 50
mySprite.vy = 50
```

### Bounce on the the edge of the screen

With a scene that has no tilemap set, make a sprite bounce on the edges of the screen.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setBounceOnWall(true)
mySprite.vx = 50
mySprite.vy = 50
```

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "level": {
        "id": "level",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMg==",
        "tileset": [
            "myTiles.transparency16",
            "sprites.dungeon.floorLight2"
        ]
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```

## See also

[set flag](/reference/sprites/sprite/set-flag), [set stay in screen](/reference/sprites/sprite/set-stay-in-screen)
