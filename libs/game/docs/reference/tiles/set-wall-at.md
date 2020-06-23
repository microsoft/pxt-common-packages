# set Wall At

Set a wall at a tile location in the tilemap.

```sig
tiles.setWallAt(null, false)
```

Tiles in a tilemap can serve as "wall" tiles to cause an action on a sprite that
comes in contact with the tile. Sprites have flags ([boolean](/types/boolean)
settings) that can set certain behavior when the contact a wall tile.

## Parameters

* **tile**: the [tile](/types/tile) location.
* **on**: a [boolean](/types/boolean) value that sets the wall **ON** if `true` or **OFF** if `false` at the tile location.

## Example #example

Create a scene with two horizontal walls. Bounce a sprite between the walls.

```blocks
namespace myTiles {
    //% blockIdentity=images._tile
    export const tile0 = img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`
}
tiles.setTilemap(tiles.createTilemap(
            hex`0a0008000000000000000000000009090909090909090909000000000000000000000000000000000000000000000000000000000000000000000000000000000909090909090909090900000000000000000000`,
            img`
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
`,
            [myTiles.tile0,sprites.castle.tilePath4,sprites.castle.tilePath3,sprites.castle.tilePath1,sprites.castle.tilePath9,sprites.castle.tilePath6,sprites.castle.tilePath8,sprites.castle.tilePath7,sprites.castle.tilePath2,sprites.castle.tilePath5],
            TileScale.Sixteen
        ))
for (let index = 0; index <= 9; index++) {
    tiles.setWallAt(tiles.getTileLocation(index, 1), true)
    tiles.setWallAt(tiles.getTileLocation(index, 6), true)
}
let mySprite = sprites.create(img`
2 5 5 5 5 5 5 5 5 5 5 5 5 5 2 2 
2 2 2 5 5 5 5 5 5 5 5 5 5 2 2 3 
7 7 2 2 5 5 5 5 5 5 5 5 2 2 3 3 
7 7 7 2 2 5 5 5 5 5 5 2 2 3 3 3 
7 7 7 7 2 5 5 5 5 5 2 2 3 3 3 3 
7 7 7 7 7 2 5 5 5 5 2 3 3 3 3 3 
7 7 7 7 7 2 2 5 5 2 2 3 3 3 3 3 
7 7 7 7 7 7 2 2 2 2 3 3 3 3 3 3 
7 7 7 7 7 7 7 2 2 3 3 3 3 3 3 3 
7 7 7 7 7 7 7 2 2 2 2 3 3 3 3 3 
7 7 7 7 7 7 2 2 4 4 4 2 2 3 3 3 
7 7 7 7 7 2 4 4 4 4 4 4 2 2 3 3 
7 7 7 2 2 4 4 4 4 4 4 4 4 2 3 3 
7 7 2 2 4 4 4 4 4 4 4 4 4 2 2 3 
7 2 2 4 4 4 4 4 4 4 4 4 4 4 2 3 
2 2 4 4 4 4 4 4 4 4 4 4 4 4 2 2 
`, SpriteKind.Player)
mySprite.setVelocity(50, 50)
mySprite.setFlag(SpriteFlag.BounceOnWall, true)
```

## See also #seealso

[set tile](/reference/tiles/set-tile), [get tile location](/reference/tiles/get-tile-location)