# destroy

Destroy the sprite.

```sig
sprites.create(null).destroy()
```

The sprite destroys itself immediately. The sprite is removed from the game and will no longer overlap or collide with any other sprites.

Sprites will also destroy when their [lifespan](/reference/sprites/sprite/lifespan) count reaches `0` or they have ``auto destroy`` set as a sprite flag when they move off screen.

## Example #example

Make a ``Player`` and an ``Enemy`` sprite. The player moves into the open area of the enemy sprite. When an overlap of the two is detected, destroy the ``Player``.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let enemy: Sprite = null
let catchBox: Image = null
let player: Sprite = null
let yellowBlock: Image = null

yellowBlock = image.create(16, 16)
yellowBlock.fill(5)
yellowBlock.drawRect(0, 0, 16, 16, 1)
player = sprites.create(yellowBlock, SpriteKind.Player)
player.left = 0
catchBox = image.create(32, 32)
catchBox.drawRect(0, 0, 32, 32, 1)
catchBox.drawLine(0, 6, 0, 25, 0)
enemy = sprites.create(catchBox, SpriteKind.Enemy)
enemy.right = scene.screenWidth() - 16
player.vx = 20
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.say("Gulp!", 1000)
    sprite.destroy()
})
```

## See also #seealso

[on destroyed](/reference/sprites/on-destroyed),
[lifespan](/reference/sprites/sprite/lifespan),
[set flag](/reference/sprites/sprite/set-flag)