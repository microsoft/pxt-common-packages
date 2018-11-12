# width (property)

Get the width of the sprite in pixels.

## Get

Get the pixel width of the sprite.

```block
let mySprite: Sprite = null

let xPixels = mySprite.width
```

```typescript-ignore
let xPixels = mySprite.width
```

### Returns

* a [number](/types/number) that is the current width of the sprite in pixels.

## Sprite sizes

The sprite size matches the size of the image it contains. The size of the sprite only changes when it's image changes. The sprite width is also the same as the difference between the left and right sides.

```block
let mySprite: Sprite = null

let width = mySprite.right - mySprite.left
```

## Example #example

Create an image that is `16` pixels wide. Make a sprite that has this image. Let the sprite say how wide it is.

```blocks
enum SpriteKind {
    Example
}
let blockImage = image.create(16, 16)
blockImage.fill(4)
let mySprite: Sprite = null
mySprite = sprites.create(blockImage, SpriteKind.Example)
mySprite.say("I'm " + mySprite.width + " pixels wide") 
```

## See also #seealso

[height](/reference/sprites/sprite/height),
[left](/reference/sprites/sprite/left),
[right](/reference/sprites/sprite/right)
