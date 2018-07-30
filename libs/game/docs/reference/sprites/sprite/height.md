# height (property)

Get the height of the sprite in pixels.

## Get

Get the pixel height of the sprite.

```block
let mySprite: Sprite = null

let yPixels = mySprite.height
```

```typescript-ignore
let yPixels = mySprite.height
```

### Returns

* a [number](/types/number) that is the current height of the sprite in pixels.

## Sprite sizes

The sprite size matches the size of the image it contains. The size of the sprite only changes when it's image changes. The sprite height is also the same as the difference between the top and bottom sides.

```block
let mySprite: Sprite = null

let height = mySprite.bottom - mySprite.top
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
mySprite.say("I'm " + mySprite.height + " pixels high") 
```

## See also #seealso

[width](/reference/sprites/sprite/width),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom)
