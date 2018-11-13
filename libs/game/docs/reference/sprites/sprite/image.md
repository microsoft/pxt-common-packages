# image (property)

Get the sprite's current image.

```block
let mySprite: Sprite = null

let currentImage = mySprite.image
```

```typescript-ignore
let currentImage = mySprite.image
```

A sprite's image is set when the sprite is created or a different image is set using [setImage](/reference/sprites/sprite/set-image).

### Returns

* the [image](/types/image) that is the currently set for the sprite.

## Example #example

Create a sprite with a checkbox that has a green border. Copy the checkbox image and change the border to a different color. Show a new sprite with the checkbox copy.

```blocks
enum SpriteKind {
    Example
}
let sprite1 = sprites.create(img`
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
7 . . . . . . . . . . . . . . 7 
7 . 2 . . . . . . . . . . 2 . 7 
7 . . 2 . . . . . . . . 2 . . 7 
7 . . . 2 . . . . . . 2 . . . 7 
7 . . . . 2 . . . . 2 . . . . 7 
7 . . . . . 2 . . 2 . . . . . 7 
7 . . . . . . 2 2 . . . . . . 7 
7 . . . . . . 2 2 . . . . . . 7 
7 . . . . . 2 . . 2 . . . . . 7 
7 . . . . 2 . . . . 2 . . . . 7 
7 . . . 2 . . . . . . 2 . . . 7 
7 . . 2 . . . . . . . . 2 . . 7 
7 . 2 . . . . . . . . . . 2 . 7 
7 . . . . . . . . . . . . . . 7 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
`, SpriteKind.Example)
sprite1.y = 40
let imgInside = sprite1.image
let imgCopy = imgInside.clone()
imgCopy.drawRect(0, 0, sprite1.width, sprite1.height, 11)
let sprite2 = sprites.create(imgCopy, 0)
sprite2.y = 80
```

## See also #seealso

[set image](/reference/sprites/sprite/set-image)
