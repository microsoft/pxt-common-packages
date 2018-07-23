# y (property)

Get or set the vertical center position of a sprite on the screen.

### Get

Get the vertical center position of the sprite.

```block
let mySprite: Sprite = null

let vert = mySprite.y
```

```typescript-ignore
let vert = mySprite.y
```

#### Returns

* a [number](/types/number) that is the current vertical center position of the sprite on the screen.

### Set

```block
let mySprite: Sprite = null

mySprite.y = 0
```

```typescript-ignore
mySprite.y = 0
```

#### Parameter

* **value**: the new vertical center position for the sprite object on the screen.

## Sprite locations

The sprite image forms a rectangle with some number of pixel rows. The **y** postion of the sprite is the vertical location of the center column of the sprite's pixels on the screen. The **y** position of the sprite can have a value that is greater than the height of the screen. It can also have a value that is less than the top side of the screen (the top of screen is `0` and the value of the **y** position of the sprite in this case is negative). When this happens, some or all of the sprite isn't visible on the screen.

## Example #example

Set the sprite **x** and **y** locations to `64`. Have the sprite say what it's **y** value is.

```blocks
enum SpriteKind {
    Example,
    Player,
    Enemy
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
7 7 2 2 2 2 2 2 2 2 2 2 2 2 7 7 
7 5 7 2 2 2 2 2 2 2 2 2 2 7 4 7 
7 5 5 7 2 2 2 2 2 2 2 2 7 4 4 7 
7 5 5 5 7 2 2 2 2 2 2 7 4 4 4 7 
7 5 5 5 5 7 2 2 2 2 7 4 4 4 4 7 
7 5 5 5 5 5 7 2 2 7 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 7 8 8 7 4 4 4 4 4 7 
7 5 5 5 5 7 8 8 8 8 7 4 4 4 4 7 
7 5 5 5 7 8 8 8 8 8 8 7 4 4 4 7 
7 5 5 7 8 8 8 8 8 8 8 8 7 4 4 7 
7 5 7 8 8 8 8 8 8 8 8 8 8 7 4 7 
7 7 8 8 8 8 8 8 8 8 8 8 8 8 7 7 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
`, SpriteKind.Example)
mySprite.x = 64
mySprite.y = 64
mySprite.say("I'm centered at y:" + mySprite.y)
```

## See also #seealso

[x](/reference/sprites/sprite/x),
[left](/reference/sprites/sprite/left),
[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom)
