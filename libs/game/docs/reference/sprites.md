# Sprites

Create and move game objects. Handle collisions between objects.

## Create sprites

```cards
sprites.create(null)
sprites.createProjectileFromSide(null, 0, 0)
sprites.createProjectileFromSprite(null, null, 0, 0)
```

## Sprite actions

```cards
sprites.create(null).say("")
sprites.create(null).overlapsWith(null)
sprites.create(null).isHittingTile(CollisionDirection.Left)
sprites.create(null).tileHitFrom(CollisionDirection.Left)
sprites.create(null).destroy()
sprites.create(null).setFlag(0, false)
sprites.create(null).setImage(null)
sprites.create(null).setPosition(0, 0)
sprites.create(null).setKind(0)
sprites.create(null).kind()
```

## Sprite effects

```cards
sprites.create(null).startEffect(effects.spray, 500)
effects.clearParticles(null)
```

## Sprite events

```cards
sprites.onCreated(0, function (sprite) {})
sprites.onDestroyed(0, function (sprite) {})
sprites.onOverlap(0, 0, function (sprite, otherSprite) {})
```

## Sprite properties

### Position

* [**x - horizontal position**](/reference/sprites/sprite/x)
* [**y - vertical position**](/reference/sprites/sprite/y)
* [**z - depth**](/reference/sprites/sprite/z)
* [**left**](/reference/sprites/sprite/left)
* [**right**](/reference/sprites/sprite/right)
* [**top**](/reference/sprites/sprite/top)
* [**bottom**](/reference/sprites/sprite/bottom)

### Physics

* [**vx - velocity x**](/reference/sprites/sprite/vx)
* [**vy- velocity y**](/reference/sprites/sprite/vy)
* [**ax - acceleration x**](/reference/sprites/sprite/ax)
* [**ay - acceleration y**](/reference/sprites/sprite/ay)

### Image and Attributes

* [**image**](/reference/sprites/sprite/image)
* [**width**](/reference/sprites/sprite/width)
* [**height**](/reference/sprites/sprite/height)
* [**lifespan**](/reference/sprites/sprite/lifespan)

## See also

[create](/reference/sprites/create),
[create projectile from sprite](/reference/sprites/create-projectile-from-sprite),
[create projectile from side](/reference/sprites/create-projectile-from-side),
[say](/reference/sprites/sprite/say),
[overlaps with](/reference/sprites/sprite/overlaps-with),
[is hitting tile](/reference/sprites/sprite-is-hittint-tile),
[tile hit from](/reference/sprites/sprite/tile-hit-from),
[destroy](/reference/sprites/sprite/destroy),
[set flag](/reference/sprites/sprite/set-flag),
[set image](/reference/sprites/sprite/set-image),
[set position](/reference/sprites/sprite/set-position),
[set kind](/reference/sprites/sprite/set-kind),
[kind](/reference/sprites/sprite/kind),
[start effect](/reference/sprites/sprite/start-effect),
[clear particles](/reference/sprites/sprite/clear-particles),
[on created](/reference/sprites/on-created),
[on destroyed](/reference/sprites/on-destroyed),
[on overlap](/reference/sprites/on-overlap)
