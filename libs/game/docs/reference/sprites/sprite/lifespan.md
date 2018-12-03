# lifespan (property)

Get or set the lifespan of sprite in milliseconds.

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

* a [number](/types/number) that is the current lifespan of the sprite in milliseconds.

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

Sprites that aren't set to auto destroy will remain in the game until they are destroyed by calling their **destroy** function or until their lifespan expires. You must set the lifespan to give a sprite a limited amount of time live. You set the lifespan of sprite to make it leave the game after some amount of time.

The lifespan of a sprite is infinite when it's created and stays that way until you actually set it to a number. Once you set it, the lifespan begins to count down to `0`. You can reset the lifespan value to keep a sprite alive longer as a bonus to your player.

## Example #example

Make a ``Player`` sprite and set its ``lifespan`` to `1000` milliseconds (or `1` second).

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let orangeBlock = image.create(16, 16)
orangeBlock.fill(4)
orangeBlock.drawRect(0, 0, 16, 16, 1)
let player = sprites.create(orangeBlock, SpriteKind.Player)
player.lifespan = 1000
```

## See also #seealso

[create](/reference/sprites/create),
[on update](/reference/game/on-update)
