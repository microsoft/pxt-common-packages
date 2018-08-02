# set Position

Set the center position of a sprite on the screen.

```sig
sprites.create(null).setPosition(0, 0)
```

### Parameters

* **x**: the new horizontal center position for the sprite on the screen.
* **y**: the new vertical center position for the sprite on the screen.

## Sprite locations

The sprite image forms a rectangle with some number of pixel rows and columns. The **x** postion of the sprite is the horizontal location of the center column of the sprite's pixels on the screen. The **y** postion of the sprite is the vertical location of the center row of the sprite's pixels.

The **x** position of the sprite can have a value that is greater than the width of the screen. It can also have a value that is less than the left side of the screen (the left of screen is `0` and the value of the **x** position of the sprite in this case is negative). When this happens, some or all of the sprite isn't visible on the screen.

Similarly, the **y** position of the sprite can have a value that is greater than the height of the screen. It can also have a value that is less than the top side of the screen (the top of screen is `0` and the value of the **y** position of the sprite in this case is negative).

## Example #example

Set the sprite **x** and **y** locations to `64`. Have the sprite say what it's **x** and **y** values are.

```blocks
enum SpriteKind {
    Example
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
mySprite.setPosition(64, 64)
mySprite.say("I'm centered at x:" + mySprite.x + ", y:" + mySprite.y)
```

## See also #seealso

[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y),
[left](/reference/sprites/sprite/left),
[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom)

