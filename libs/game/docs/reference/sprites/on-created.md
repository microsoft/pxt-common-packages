# on Created

Run some code when a sprite is created.


```sig
sprites.onCreated(0, function (sprite) {

})
```

Sprites are created by using the [create](/reference/sprites/sprite/destroy) and [create projectile](/reference/sprites/create-projectile) functions. You can respond to a sprite create event and run some code when it happens.

Sprites have three types: ``player``, ``food``, ``coin``. You can track the creation of any sprite with a particular type by using the sprite object parameter called ``sprite``.

```blocks
sprites.onCreated(SpriteKind.Player, function (sprite) {
    sprite.say("Hello, I'm new here")
})
let smiley = sprites.create(img`
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
    `, SpriteKind.Player)
```

## Parameters

* **type**: the type of sprite to watch for a create event on. These are ``player``, ``food``, and ``coin``.
* **sprite**: the [sprite](/types/sprite) to watch for a create event on. Use ``sprite`` for a destroy event on all sprites of a certain **type**.
* **handler**: the code to run when the sprite is created.

## Example #example

Create a ``player`` sprite as an "observer" for the creation and destruction of a ``food`` sprite. Have the observer say something when some food is created and when it's created.

```blocks
sprites.onDestroyed(SpriteKind.Food, function (sprite) {
    viewer.say("food's gone!!", 1000)
})
sprites.onCreated(SpriteKind.Food, function (sprite) {
    viewer.say("I see food!", 1000)
})
let viewer: Sprite = null
let playerBlock = image.create(16, 16)
playerBlock.fill(7)
viewer = sprites.create(playerBlock, SpriteKind.Player)
viewer.setPosition(8, 32)
let foodBlock = image.create(32, 32)
foodBlock.fill(8)
pause(1000)
let snack = sprites.create(foodBlock, SpriteKind.Food)
snack.say("new food here")
pause(2000)
snack.destroy()
```

## See also #seeaslo

[on destroyed](/reference/sprites/on-destroyed),
[create](/reference/sprites/sprite/destroy),
[create projectile](/reference/sprites/create-projectile)