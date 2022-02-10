# Location

The Location object contains the postition information of a game element on the tilemap.

## column (property)

Get a tile column position of an object on the tilemap.

```block
let location: tiles.Location = null

let col = location.column
```

```typescript-ignore
let col = location.column
```

### Returns

* a [number](/types/number) that is the tile column position of object on the tilemap.

## row (property)

Get a tile row position of an object on the tilemap.

```block
let location: tiles.Location = null

let row = location.row
```

```typescript-ignore
let row = location.row
```

### Returns

* a [number](/types/number) that is the tile row position of object on the tilemap.

## x (property)

Get the horizontal center position of an object on the tilemap.

```block
let location: tiles.Location = null

let horz = location.x
```

```typescript-ignore
let horz = location.x
```

### Returns

* a [number](/types/number) that is the current horizontal center position, in pixels, of the object on the tilemap.

## y (property)

Get the vertical center position of an object on the tilemap.

```block
let location: tiles.Location = null

let vert = location.y
```

```typescript-ignore
let vert = location.y
```

### Returns

* a [number](/types/number) that is the vertical center position, in pixels, of object on the tilemap.

## left (property)

Get the of position of left side an object on the tilemap.

```block
let location: tiles.Location = null

let left = location.left
```

```typescript-ignore
let left = location.left
```

### Returns

* a [number](/types/number) that is the left side, in pixels, of object on the tilemap.

## right (property)

Get the of position of right side an object on the tilemap.

```block
let location: tiles.Location = null

let right = location.right
```

```typescript-ignore
let right = location.right
```

### Returns

* a [number](/types/number) that is the right side, in pixels, of object on the tilemap.

## top (property)

Get the of position of top side an object on the tilemap.

```block
let location: tiles.Location = null

let top = location.top
```

```typescript-ignore
let top = location.top
```

### Returns

* a [number](/types/number) that is the right side, in pixels, of object on the tilemap.

## bottom (property)

Get the of position of bottom side an object on the tilemap.

```block
let location: tiles.Location = null

let bottom = location.bottom
```

```typescript-ignore
let bottom = location.bottom
```

### Returns

* a [number](/types/number) that is the right side, in pixels, of object on the tilemap.

## Example #example

Make checkered table cloth with tiles on a tilemap. Create a hamburger sprite and randomly locate it on the table cloth. Find out where the hamburger is and display its location.

```blocks
tiles.setCurrentTilemap(tilemap`level1`)
let mySprite = sprites.create(img`
    ...........ccccc66666...........
    ........ccc4444444444666........
    ......cc444444444bb4444466......
    .....cb4444bb4444b5b444444b.....
    ....eb4444b5b44444b44444444b....
    ...ebb44444b4444444444b444446...
    ..eb6bb444444444bb444b5b444446..
    ..e6bb5b44444444b5b444b44bb44e..
    .e66b4b4444444444b4444444b5b44e.
    .e6bb444444444444444444444bb44e.
    eb66b44444bb444444444444444444be
    eb66bb444b5b44444444bb44444444be
    fb666b444bb444444444b5b4444444bf
    fcb666b44444444444444bb444444bcf
    .fbb6666b44444444444444444444bf.
    .efbb66666bb4444444444444444bfe.
    .86fcbb66666bbb44444444444bcc688
    8772effcbbbbbbbbbbbbbbbbcfc22778
    87722222cccccccccccccccc22226678
    f866622222222222222222222276686f
    fef866677766667777776667777fffef
    fbff877768f86777777666776fffffbf
    fbeffeefffeff7766688effeeeefeb6f
    f6bfffeffeeeeeeeeeeeeefeeeeebb6e
    f66ddfffffeeeffeffeeeeeffeedb46e
    .c66ddd4effffffeeeeeffff4ddb46e.
    .fc6b4dddddddddddddddddddb444ee.
    ..ff6bb444444444444444444444ee..
    ....ffbbbb4444444444444444ee....
    ......ffebbbbbb44444444eee......
    .........fffffffcccccee.........
    ................................
    `, SpriteKind.Player)
mySprite.setPosition(randint(16, 144), randint(16, 104))
let location = mySprite.tilemapLocation()
let displayString = "My hamburger is at "
displayString = "" + displayString + "x = "
displayString = "" + displayString + location.x + ", y = " + location.y
displayString = "" + displayString + " and over the tile at column = "
displayString = "" + displayString + location.column + ", row = " + location.row
game.showLongText(displayString, DialogLayout.Bottom)
```

## See also #seealso

[get neighboring location](/reference/scene/get-neighboring-location)

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "tile3": {
        "data": "hwQQABAAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile1"
    },
    "tile4": {
        "data": "hwQQABAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile2"
    },
    "tile5": {
        "data": "hwQQABAAAACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true,
        "displayName": "myTile3"
    },
    "level1": {
        "id": "level1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAzMDEwMzAxMDMwMTAzMDEwMzAxMDEwMzAyMDMwMjAzMDIwMzAyMDMwMzAyMDMwMjAzMDIwMzAyMDMwMTAxMDMwMjAzMDIwMzAyMDMwMjAzMDMwMjAzMDIwMzAyMDMwMjAzMDEwMTAzMDIwMzAyMDMwMjAzMDIwMzAzMDIwMzAyMDMwMjAzMDIwMzAxMDEwMzAxMDMwMTAzMDEwMzAxMDMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
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