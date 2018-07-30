# type (property)

Get or set the type of sprite kind.

## Get

Get the sprite kind type.

```block
let mySprite: Sprite = null

let myKind = mySprite.type
```

```typescript-ignore
let myKind = mySprite.type
```

### Returns

* a [number](/types/number) that is the current sprite kind type.

## Set

```block
let mySprite: Sprite = null

mySprite.type = 0
```

```typescript-ignore
mySprite.type = 0
```

### Parameter

* **value**: the new kind type to set for the sprite.

## Sprite kinds

To keep track of different types of sprites, you can assign a _kind_ to them. This is a value that will help identify them and decide what actions to take when events happen in the game. There are no particular rules or names for how you decide on what the kinds should be. A good way to do it though is to make an enumerated list of kinds like this:

```typescript
enum SpriteKind {
    Player,
    Enemy
}
```

Then, when you create a sprite, you can optionally assign it a kind:

```block
enum SpriteKind {
    Player,
    Enemy
}
let mySprite = sprites.create(img`
2 4
4 2
`, SpriteKind.Player)
```

```typescript-ignore
let mySprite = sprites.create(img`
2 4
4 2
`, SpriteKind.Player)
```

If you were making a space game, you might have kinds like this:

```typescript
enum SpriteKind {
    Ship,
    Planet,
    Asteroid,
    Moon
}
```

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
    friend1.type = SpriteKind.Friend
    friend2.type = SpriteKind.Friend
})
game.onUpdateInterval(2000, function () {
    if (friend1.type == SpriteKind.Friend) {
        friend1.type = SpriteKind.Enemy
    } else if (friend2.type == SpriteKind.Friend) {
        friend2.type = SpriteKind.Enemy
    }
})
```

## See also #seealso

[create](/reference/sprites/sprite/create)
