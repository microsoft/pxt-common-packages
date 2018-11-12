# set Image 

Set a new image for the sprite.

```sig
sprites.create(null).setImage(null)
```

The image currently set for the sprite is replaced by the new image. The new image is displayed for the sprite.

## Parameters

* **img**:  [image](/types/image) that is the currently set for the sprite.

## Example #example

Make two square block images, one with green pixels, the other with orange pixels. Every second, set the green or the orange image to the sprite on the screen.

```blocks
let mySprite: Sprite = null
let image2: Image = null
let image1: Image = null
let toggle = false
image1 = image.create(32, 32)
image2 = image1.clone()
image1.fill(7)
image2.fill(4)
mySprite = sprites.create(image1, 0)
game.onUpdateInterval(1000, function () {
    if (toggle) {
        mySprite.setImage(image1)
    } else {
        mySprite.setImage(image2)
    }
    toggle = !(toggle)
})
```

## See also #seealso

[image](/reference/sprites/sprite/image)
