# destroy

Destroy this sprite.

```sig
sprites.create(null).destroy()
```

The sprite is destroyed. It stops if it's moving and disappears from the scene.

## Example #example

Send a blue square sprite across the screen to the right. Destroy it when it reaches two-thirds the distance across the screen.

```blocks
let blueBlock = image.create(16, 16)
blueBlock.fill(4)
let blockGo = sprites.create(blueBlock)
blockGo.x = 8
blockGo.vx = 30
game.onUpdate(function () {
    if (blockGo.x > scene.screenWidth() * 2 / 3) {
        blockGo.destroy()
    }
})
```

## #seealso