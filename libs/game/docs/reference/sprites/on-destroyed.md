# on Destroyed

Run some code when a sprite is destroyed.


```sig
sprites.onDestroyed(SpriteType.Player, function (sprite) {

})
```

Sprites are destroyed by using the [destroy](/reference/sprites/sprite/destroy) function or if they are set to destroy automatically, like when a projectile leaves the screen. You can respond to a sprite destroy event and run some code when it happens.

Sprites have three types: ``player``, ``food``, ``coin``. You can track the destruction of all sprites with a particular type by using the general sprite object called ``sprite``.

```block
sprites.onDestroyed(SpriteType.Food, function (sprite) {

})
```

If you want to track the destruction of a just a single sprite, use the actual sprite object itself.

```block
let smiley: Sprite = null
smiley = sprites.create(img`
. . . . . f f f f f f f . . . . 
. . . f f e e e e e e e f . . . 
. . f e e e e e e e e e e f . . 
. f e e e e e e e e e e e e f . 
f e e e e f f e e e f f e e e f 
f e e e e f f e e e f f e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e f e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e f e e e e e f e e e f 
f e e e e e f f f f f e e e e f 
. f e e e e e e e e e e e e f . 
. . f e e e e e e e e e e f . . 
. . . f f e e e e e e e f . . . 
. . . . . f f f f f f f . . . . 
`)
sprites.onDestroyed(SpriteType.Player, function (smiley) {

})
```

## Parameters

* **type**: the type of sprite to watch for a destroy event on. These are ``player``, ``food``, and ``coin``.
* **sprite**: the [sprite](/types/sprite) to watch for a destroy event on. Use ``sprite`` for a destroy event on all sprites of a certain **type**.
* **handler**: the code to run when the sprite is destoryed.

## Example #example

Create a ``player`` sprite as an "observer" for the creation and destruction of a ``food`` sprite. Have the observer say something when some food is created and when it's destroyed.

```blocks
let snack: Sprite = null
let foodBlock: Image = null
let viewer: Sprite = null
let playerBlock: Image = null

playerBlock = image.create(16, 16)
playerBlock.fill(7)
viewer = sprites.create(playerBlock, SpriteType.Player)
viewer.setPosition(8, 32)
foodBlock = image.create(32, 32)
foodBlock.fill(8)
pause(1000)
snack = sprites.create(foodBlock, SpriteType.Food)
snack.say("new food here")
pause(2000)
snack.destroy()

sprites.onCreated(SpriteType.Food, function (sprite) {
    viewer.say("I see food!", 1000)
})
sprites.onDestroyed(SpriteType.Food, function (sprite) {
    viewer.say("food's gone!", 1000)
})
```

## See also #seeaslo

[on created](/reference/sprites/on-created),
[destroy](/reference/sprites/sprite/destroy)