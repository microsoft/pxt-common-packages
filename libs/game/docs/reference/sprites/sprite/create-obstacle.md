# create Obstacle

Make a sprite that is used to cause collisions with other sprites.

```sig
sprites.createObstacle(null)
```

An obstacle is just like other sprites that you can locate and move except that it is given the ability to cause collisions. Sprites have functions to check for obstacles so you can have code to avoid them or handle a collision when it happens.

## Parameters

* **img**: an [image](/types/image) to create and obstacle for.

## Returns

* a type of [sprite](/types/sprite) that is used to cause collisions with other sprites.

## Example #example

Send a sprite toward a barrier. When it contacts the barrier, have it bounce back to its starting position.

```blocks
let greenBoxGo: Sprite = null
let barrier: Sprite = null
let shield: Image = null
let greenBox: Image = null
greenBox = image.create(32, 32)
greenBox.fill(7)
shield = image.create(4, 64)
shield.fill(10)
barrier = sprites.createObstacle(shield)
barrier.x = scene.screenWidth() - 4
greenBoxGo = sprites.create(greenBox)
greenBoxGo.x = 16
greenBoxGo.ax = 80

greenBoxGo.onCollision(CollisionDirection.Right, function (shield) {
    greenBoxGo.x = 16
})
```

## See also #seealso

[obstacle](/reference/sprites/sprite/obstacle),
[has obstacle](/reference/sprites/sprite/has-obstacle),
[on collision](/reference/sprites/sprite/on-collision)