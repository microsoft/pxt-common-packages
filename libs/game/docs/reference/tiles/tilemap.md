# tilemap

A tilemap object that defines a player level for the game scene.

```sig
tiles._tilemapEditor(null)
```

A **tilemap** is a data object that contains the dimensions, layers, and tiles for a tile mapping used to set the scene of a game.

## Creating and using tilemaps

Tilemaps aren't coded by the user but are created using a tilemap editor. When you add a tilemap to your project, it contains a default layout having all of it rows and columns filled with transparent tiles.

```block
tiles.setCurrentTilemap(tilemap`level2`)
```

You modify the tilemap using the Tilemap Editor. When coding with blocks, the Tilemap Editor will open when you click on the map image in the tilemap block. If you're editing code, the Tilemap Editor opens by clicking the map symbol in the line of code where you use the tilemap.

You design your game scene, or _level_, using the tiles your create or by chosing some from the tile library. You also can set the tilemap size and tile attributes. The example here shows a tilemap created for a maze game: 

```block
tiles.setCurrentTilemap(tilemap`level1`)
```

After editing, a tilemap is saved as a project asset. The tilemap is defined as a level and assigned an identifier like `level1`. In code, you use the tilemap with its identifier like this:

```typescript-ignore
tiles.setCurrentTilemap(tilemap`level1`)
```

You can use a tilemap directly in scene and tile operations, or as an assigned variable:

```block
let myTilemap = tilemap`level1`
tiles.setCurrentTilemap(myTilemap)
```

## The tilemap object

Tilemaps are complex data objects and are defined as levels which contain tiles at various row and column locations. When a tilemap is added to a project, the project assets will include both the tilemap and its tiles. A tilemap's asset data might look like the following:

```typescript-ignore
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "tile2": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "tile3": {
        "data": "hwQQABAAAACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAyMDAwMDAwMDEwMTAwMDMwMzAwMDIwMjAwMDAwMDAxMDAwMDAzMDAwMDAwMDAwMDAxMDEwMDAwMDAwMDAzMDAwMDAwMDEwMDAwMDIwMDAwMDMwMDAzMDAwMTAxMDAwMjAyMDAwMDAwMDMwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1",
            "myTiles.tile2",
            "myTiles.tile3"
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

## See also

[set current tilemap](/reference/tiles/set-current-tilemap)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile1": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile"
    },
    "tile2": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile0"
    },
    "tile3": {
        "data": "hwQQABAAAACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"    
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAyMDAwMDAwMDEwMTAwMDMwMzAwMDIwMjAwMDAwMDAxMDAwMDAzMDAwMDAwMDAwMDAxMDEwMDAwMDAwMDAzMDAwMDAwMDEwMDAwMDIwMDAwMDMwMDAzMDAwMTAxMDAwMjAyMDAwMDAwMDMwMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "myTiles.tile1",
            "myTiles.tile2",
            "myTiles.tile3"
        ],
        "displayName": "level1"
    },
    "level2": {
        "id": "level2",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16"
        ],
        "displayName": "level4"
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```