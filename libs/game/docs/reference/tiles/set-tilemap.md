# set Tilemap

Set a tilemap as the current tilemap for the game scene.

```sig
tiles.setTilemap(null)
```

A [tilemap](/reference/tiles/tilemap) is a data object that contains the dimensions, layers, and tile list for a tile mapping to set as the scene for a game. A game program can have more than one tilemap defined and the game's scene or _level_ can change by setting a different tilemap at certain times during a game.

Tilemaps aren't coded by the user but are created using a tilemap editor. Each tilemap in a game project is a named resource and is contained within the project's **assets** collection. In code, a particular tilemap is specified with it's resource name like this:

```typescript
tiles.setTilemap(tilemap`level1`)
```

## Parameters

* **tilemap**: the [tilemap](/reference/tiles/tilemap) data containing the tilemap layout and tiles to set for the game scene. The tilemap can be specified by it's resource name, such as: `` tilemap`level1` ``.

## Example #example

Create a maze tilemap for a sprite to travel through. Set the tilemap as the scene for the game. Create a sprite and start it travelling in the maze.

```blocks
tiles.setTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.setPosition(0, 104)
mySprite.vx = 16
```

## See also #seealso

[tilemap](/reference/tiles/tilemap),
[set tile at](/reference/scene/set-tile-at)

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
        "displayName": "myTile0"
    },
    "tile2": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDEwMTAwMDIwMjAyMDAwMjAyMDAwMTAxMDAwMjAwMDIwMDAyMDIwMDAwMDEwMDAyMDAwMjAwMDIwMDAwMDEwMTAwMDIwMDAyMDIwMjAwMDIwMTAwMDAwMDAwMDAwMDAyMDAwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEyMjIyMjIyMjIyMDIwMDAwMDAyMDAyMjIwMjIyMjAwMjAyMDIyMjAwMDIwMjAyMDIyMDAyMDIyMjAyMjIwMDAwMDAwMjIwMjIyMjIyMjIyMg==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1",
            "myTiles.tile2"
        ],
        "displayName": "maze"
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```