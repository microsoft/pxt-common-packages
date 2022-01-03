# tile Kind At

Check if the tile next to a sprite is the one you're looking for.

```sig
sprites.create(null).tileKindAt(TileDirection.Right, null)
```

A tile next to a sprite can be matched to a tile you want to check for. You choose the direction to check for to see if the tile is next to the sprite. If the tile matches the one you are looking for in that direction, it will detect it when the sprite is within one-half of it's dimension for that direction.

## Parameters

* **direction**: the direction from the sprite for the tile check: `left`, `right`, `top`, or `bottom`.
* **tile**: an [image](/types/image) that matches the tile you're looking for.

## Returns

* a [boolean](/types/boolean) value that is `true` if the tile near the sprite at the **direction** matches the **tile** you want to check for. If not, `false` is returned.

## Example #example

Make a tilemap with three columns of tiles with a different color for each. Set a sprite in motion from left to right. When the sprite comes near a tile, check to see what color the tile is.

```blocks
tiles.setTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . 1 1 9 9 9 9 9 9 1 1 . . . 
    . . . 1 9 9 9 9 9 9 9 9 1 . . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . 1 9 9 9 9 9 9 9 9 9 9 1 . . 
    . . . 1 9 9 9 9 9 9 9 9 1 . . . 
    . . . 1 1 9 9 9 9 9 9 1 1 . . . 
    . . . . . 1 1 1 1 1 1 . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.x = 0
game.onUpdateInterval(100, function () {
    if (mySprite.tileKindAt(TileDirection.Right, assets.tile`myTile2`)) {
        mySprite.sayText("red", 100, false)
    } else if (mySprite.tileKindAt(TileDirection.Right, assets.tile`myTile1`)) {
        mySprite.sayText("green", 100, false)
    } else if (mySprite.tileKindAt(TileDirection.Right, assets.tile`myTile3`)) {
        mySprite.sayText("yellow", 100, false)
    } else if (mySprite.right >= scene.screenWidth()) {
        mySprite.x = 0
    }
    mySprite.x += 2
})
```

## See also #seealso

[is hitting tile](/reference/scene/is-hitting-tile)

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
    "tile2": {
        "data": "hwQQABAAAACIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "tile3": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "tile4": {
        "data": "hwQQABAAAAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile2"
    },
    "tile5": {
        "data": "hwQQABAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile3"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMTAwMDAwMzAwMDAwMjAwMDAwMDAxMDAwMDAzMDAwMDAyMDAwMDAwMDEwMDAwMDMwMDAwMDIwMDAwMDAwMTAwMDAwMzAwMDAwMjAwMDAwMDAxMDAwMDAzMDAwMDAyMDAwMDAwMDEwMDAwMDMwMDAwMDIwMDAwMDAwMTAwMDAwMzAwMDAwMjAwMDAwMDAxMDAwMDAzMDAwMDAyMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile3",
            "myTiles.tile4",
            "myTiles.tile5"
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