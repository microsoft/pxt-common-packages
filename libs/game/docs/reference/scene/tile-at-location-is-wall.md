# tile At Location Is Wall

Check if a tile at a location in the tilemap is also a wall tile.

```sig
tiles.tileAtLocationIsWall(null)
```

The tile in the tilemap at the location selected is checked to see if it is set as a wall. After they are placed in the tilemap with the Tilemap Editor, tiles can be set as _wall_ tiles.

## Parameters

* **location**: the [location](/reference/scene/location) object for the tile to check if it's a wall.

## Returns

* a [boolean](/types/boolean) value that is `true` if the tile at **location** is a wall. The value is `false` if the tile is not a wall.

## Example #example

Set a tilemap with two columns of the same tile. Make one of the columns be all wall tiles. Send a ghost sprite across both colunms so it can detect which one is the wall.

```blocks
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile0`, function (sprite, location) {
    if (tiles.tileAtLocationIsWall(location)) {
        mySprite.sayText("That's a wall!")
    } else {
        mySprite.sayText("Not a wall.")
    }
})
let mySprite: Sprite = null
scene.setBackgroundColor(11)
tiles.setCurrentTilemap(tilemap`level1`)
mySprite = sprites.create(img`
    ........................
    ........................
    ........................
    ........................
    ..........ffff..........
    ........ff1111ff........
    .......fb111111bf.......
    .......f11111111f.......
    ......fd11111111df......
    ......fd11111111df......
    ......fddd1111dddf......
    ......fbdbfddfbdbf......
    ......fcdcf11fcdcf......
    .......fb111111bf.......
    ......fffcdb1bdffff.....
    ....fc111cbfbfc111cf....
    ....f1b1b1ffff1b1b1f....
    ....fbfbffffffbfbfbf....
    .........ffffff.........
    ...........fff..........
    ........................
    ........................
    ........................
    ........................
    `, SpriteKind.Player)
mySprite.left = 0
mySprite.setFlag(SpriteFlag.GhostThroughWalls, true)
mySprite.vx = 30
```

## See also #seealso

[get tile location](/reference/scene/get-tile-location)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAABmZmZmZmZmZmZvZmZmb2ZmZmZm9mZm9mZmZm9mb2ZmZvZmZmZmZm9mZmZmZmZmZmZmZmZmZmZmZmb2ZvZmb2Zm9mZmZmZm9mZmZmZmZmZmZmb2b2b2ZmZmZmZmZmZmZm9mZmb2ZmZmZmb2ZmZm9mZvZmZmZvZmZvZmZmZmZmZmZg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAxMDAwMDAxMDAwMDAwMDAwMDAwMDEwMDAwMDEwMDAwMDAwMDAwMDAwMTAwMDAwMTAwMDAwMDAwMDAwMDAxMDAwMDAxMDAwMDAwMDAwMDAwMDEwMDAwMDEwMDAwMDAwMDAwMDAwMTAwMDAwMTAwMDAwMDAwMDAwMDAxMDAwMDAxMDAwMDAwMDAwMDAwMDEwMDAwMDEwMDAwMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMA==",
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