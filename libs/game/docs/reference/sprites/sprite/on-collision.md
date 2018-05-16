# on Collision

Run some code when a sprite collides with an obstacle.

```sig
sprites.create(null).onCollision(null, function (other: Sprite) {

})
```

If a sprite collides with an obstacle, you can run some code when it happens. The collision is detected for the direction of motion you select. Also, you choose which obstacle to detect a collision with.

## Parameters

* **direction**: the direction of movement to detect a collion for.
* **handler**: the code to run when a collision happens while the sprite is moving toward **direction**.
* **other**: the obstacle to check for a collision.

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
[create obstacle](/reference/sprites/sprite/create-obstacle)