# x  (property)

Get or set the horizontal center position of a sprite on the screen.

### Get

Get the horizontal center position of the sprite.

```block
let mySprite: Sprite = null

let horz = mySprite.x
```

#### Returns

* a [number](/types/number) that is the current horizontal center position of sprite on the screen.

### Set

```block
let mySprite: Sprite = null

mySprite.x = 0
```

#### Parameter

* **value**: the new horizontal center position for the sprite on the screen.

## Sprite locations

The sprite image forms a rectangle with some number of pixel columns. The **x** postion of the sprite is the horizontal location of the center column of the sprite's pixels on the screen. The **x** position of the sprite can have a value that is greater than the width of the screen. It can also have a value that is less than the left side of the screen (the left of screen is `0` and the value of the **x** position of the sprite in this case is negative). When this happens, some or all of the sprite isn't visible on the screen.

## Example #example

Set the sprite **x** and **y** locations to `64`. Have the sprite say what it's **x** value is.

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
mySprite.say("I'm centered at x:" + mySprite.x)
```

## See also #seealso

[y](/reference/sprites/sprite/y),
[left](/reference/sprites/sprite/left),
[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom)
