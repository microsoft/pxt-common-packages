# z (property)

Get or set the depth level (Z-order) of a sprite on the screen.

## Get

Get the depth level of the sprite.

```block
let mySprite: Sprite = null

let depth = mySprite.z
```

### Returns

* a [number](/types/number) that is the current depth of sprite on the screen.

## Set

```block
let mySprite: Sprite = null

mySprite.z = 0
```

### Parameter

* **value**: the new depth for the sprite on the screen.

## Sprite depth

The sprite image is a two-dimensional rectangle. You can assign a depth level to a sprite so that it will appear above or below sprites that are at different depth levels. This gives a third dimension to sprites even though they aren't really solid objects. The depth level is called the _Z-order_ referring to the third dimension of **z**.

Sprites have a depth of `0` when they are created. Sprites at the same depth level will have their pixels overlap based on when they were created. Sprites created later will overlap the sprites created earlier when they are in the same level. To control the overlap of sprites, you can assign them to different levels in the Z-order. Sprites with a higher value for **z** will overlap the sprites with a lower **z** value.

## Examples #example

### Move over and under #ex1

Make two block sprites of green and orange. Have the orange sprite move across the green one. Each time the orange sprite passes by the green one, have it change its Z-order so it will go either under or over.

```blocks
enum SpriteKind {
    Example
}
let greenBlock = image.create(32, 48)
greenBlock.fill(7)
let orangeBlock = image.create(48, 16)
orangeBlock.fill(4)
let greenSprite = sprites.create(greenBlock, SpriteKind.Example)
let orangeSprite = sprites.create(orangeBlock, SpriteKind.Example)
greenSprite.z = 0
orangeSprite.left = 0
orangeSprite.z = 1
orangeSprite.vx = 40

game.onUpdateInterval(500, function () {
    if (orangeSprite.x < 0 || orangeSprite.x > scene.screenWidth()) {
        orangeSprite.vx = orangeSprite.vx * -1
        if (orangeSprite.z < 0) {
            orangeSprite.z = 1
            greenSprite.say("over")
        } else {
            orangeSprite.z = -1
            greenSprite.say("under")
        }
    }
})
```

### Overlapping squares #ex2

Use an array to hold a set of overlapping block sprites with different colors. Set a **Z** value for each sprite that is one greater then the previous sprite. When any button is clicked, reverse the Z-order for the set of sprites so that they overlap in the opposite direction.

```blocks
enum SpriteKind {
    Example
}
let colorBlocks: Sprite[] = []
let blockImg: Image = null
controller.anyButton.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let i = 0; i <= 8 - 1; i++) {
        colorBlocks[i].z = colorBlocks[i].z * -1
    }
})
for (let j = 0; j <= 8 - 1; j++) {
    blockImg = image.create(32, 32)
    blockImg.fill(j + 2)
    blockImg.drawRect(0, 0, 32, 32, 1)
    colorBlocks[j] = sprites.create(blockImg, 0)
    colorBlocks[j].left = j * 16 + 8
    colorBlocks[j].top = j * 10 + 8
    colorBlocks[j].z = j
}
```

## See also #seealso

[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y)
