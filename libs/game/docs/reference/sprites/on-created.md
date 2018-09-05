# on Created

Run some code when a sprite is created.


```sig
sprites.onCreated(SpriteType.Player, function (sprite) {

})
```

Sprites are created by using the [create](/reference/sprites/sprite/destroy) and [create projectile](/reference/sprites/create-projectile) functions. You can respond to a sprite create event and run some code when it happens.

Sprites have three types: ``player``, ``food``, ``coin``. You can track the creation of any sprite with a particular type by using the sprite object parameter called ``sprite``.

```blocks
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
sprites.onCreated(SpriteType.Player, function (sprite) {
    sprite.say("Hello, I'm new here")
})
```

## Parameters

* **type**: the type of sprite to watch for a create event on. These are ``player``, ``food``, and ``coin``.
* **sprite**: the [sprite](/types/sprite) to watch for a create event on. Use ``sprite`` for a destroy event on all sprites of a certain **type**.
* **handler**: the code to run when the sprite is created.

## Example #example

Create a ``player`` sprite as an "observer" for the creation and destruction of a ``food`` sprite. Have the observer say something when some food is created and when it's created.

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

[on destroyed](/reference/sprites/on-destroyed),
[create](/reference/sprites/sprite/destroy),
[create projectile](/reference/sprites/create-projectile)