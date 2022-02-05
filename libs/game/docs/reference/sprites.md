# Sprites

Create and move game objects. Handle overlaps between objects.

## Create sprites

```cards
sprites.create(img`.`, SpriteKind.Player)
sprites.createProjectileFromSprite(img`.`, null, 50, 50)
sprites.createProjectileFromSide(img`.`, 50, 50)
```

## Sprite actions

```cards
sprites.create(null).say("")
sprites.create(null).overlapsWith(null)
sprites.create(null).destroy()
sprites.create(null).setFlag(0, false)
sprites.create(null).setImage(null)
sprites.create(null).setPosition(0, 0)
sprites.create(null).setKind(0)
sprites.create(null).kind()
sprites.create(null).setBounceOnWall(false)
sprites.create(null).setStayInScreen(false)
sprites.create(null).setScale(1, ScaleAnchor.Middle)
sprites.create(null).changeScale(1, ScaleAnchor.Middle)
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
* [**vy - velocity y**](/reference/sprites/sprite/vy)
* [**ax - acceleration x**](/reference/sprites/sprite/ax)
* [**ay - acceleration y**](/reference/sprites/sprite/ay)
* [**fx - friction x**](/reference/sprites/sprite/fx)
* [**fy - friction y**](/reference/sprites/sprite/fy)

### Image and Attributes

* [**image**](/reference/sprites/sprite/image)
* [**width**](/reference/sprites/sprite/width)
* [**height**](/reference/sprites/sprite/height)
* [**lifespan**](/reference/sprites/sprite/lifespan)

### Scaling

* [**sx - scale x**](/reference/sprites/sprite/sx)
* [**sy - scale y**](/reference/sprites/sprite/sy)
* [**scale**](/reference/sprites/sprite/scale)

## See also

[create](/reference/sprites/create),
[create projectile from side](/reference/sprites/create-projectile-from-side),
[create projectile from sprite](/reference/sprites/create-projectile-from-sprite),
[say](/reference/sprites/sprite/say),
[overlaps with](/reference/sprites/sprite/overlaps-with),
[destroy](/reference/sprites/sprite/destroy),
[set flag](/reference/sprites/sprite/set-flag),
[set stay in screen](/reference/sprites/sprite/set-stay-in-screen),
[set bounce on wall](/reference/sprites/sprite/set-bounce-on-wall),
[set image](/reference/sprites/sprite/set-image),
[set position](/reference/sprites/sprite/set-position),
[set kind](/reference/sprites/sprite/set-kind),
[kind](/reference/sprites/sprite/kind),
[start effect](/reference/sprites/sprite/start-effect),
[clear particles](/reference/sprites/sprite/clear-particles),
[on created](/reference/sprites/on-created),
[on destroyed](/reference/sprites/on-destroyed),
[on overlap](/reference/sprites/on-overlap),
[set scale](/reference/sprites/sprite/set-scale),
[change scale](/reference/sprites/sprite/change-scale)
