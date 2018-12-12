# kind

Get the kind of the sprite.

```sig
sprites.create(null).kind()
```

To keep track of different types of sprites, you can assign a _kind_ to them. This is a value that will help identify them and decide what actions to take when events happen in the game. There are no particular rules or names for how you decide on what the kinds should be. The sprite kinds in your game might be defined like this:

```typescript
enum SpriteKind {
    Player,
    Enemy
}
```

## Returns

* a [number](/types/number) value that is the current sprite kind.

## Example #example

Make a ``Player`` sprite and two ``Friend`` sprites. Every 2 seconds, turn one of the friend sprites into an ``Enemy``. Every 10 seconds have the enemy sprites become friends again.

```blocks
enum SpriteKind {
    Player,
    Friend,
    Enemy
}
let player: Sprite = null
let friend2: Sprite = null
let friend1: Sprite = null
let greenBlock: Image = null
greenBlock = image.create(16, 16)
greenBlock.fill(7)
player = sprites.create(greenBlock, SpriteKind.Player)
friend1 = sprites.create(greenBlock, SpriteKind.Friend)
friend1.x = scene.screenWidth() / 4
friend2 = sprites.create(greenBlock, SpriteKind.Friend)
friend2.x = scene.screenWidth() * 3 / 4
game.onUpdateInterval(10000, function () {
    friend1.setKind(SpriteKind.Friend)
    friend2.setKind(SpriteKind.Friend)
})
game.onUpdateInterval(2000, function () {
    if (friend1.kind() == SpriteKind.Friend) {
        friend1.setKind(SpriteKind.Enemy)
    } else if (friend2.kind() == SpriteKind.Friend) {
        friend2.setKind(SpriteKind.Enemy)
    }
})
```

## See also #seealso

[set kind](/reference/sprites/sprite/set-kind)
