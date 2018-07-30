# lifespan (property)

Get or set the lifespan of sprite in update units.

## Get

Get the lifespan of the sprite.

```block
let mySprite: Sprite = null

let lifetime = mySprite.lifespan
```

```typescript-ignore
let lifetime = mySprite.lifespan
```

### Returns

* a [number](/types/number) that is the current lifespan of the sprite.

## Set

```block
let mySprite: Sprite = null

mySprite.lifespan = 0
```

```typescript-ignore
mySprite.lifespan = 0
```

### Parameter

* **value**: the new lifespan of the sprite.

## Sprite lifespan

Sprites that aren't set to auto destroy will remain in the game until they are destroyed by calling their **destroy** function or until their lifespan expires. You can set the lifespan of sprite to make it leave the game after some amount of time.

The game has it's own internal update interval similar to your program's **onUpdate** function. During this interval the lifespan of the sprite, if it was set, will decrease by `1` unit. When the lifespan becomes `0`, the sprite is destroyed.

The lifespan of a sprite is infinite when it's created and stays that way until you actually set it to a number. Once you set it, the lifespan begins to count down to `0`. You can reset the lifespan value to keep a sprite alive longer as a bonus to your player.

## Example #example

Make a ``Player`` sprite and set its ``lifespan`` to `100` units.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let orangeBlock = image.create(16, 16)
orangeBlock.fill(4)
orangeBlock.drawRect(0, 0, 16, 16, 1)
let player = sprites.create(orangeBlock, SpriteKind.Player)
player.lifespan = 100
```

## See also #seealso

[create](/reference/sprites/create),
[on update](/reference/game/on-update)
