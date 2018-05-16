# obstacle

Get an obstacle sprite in a certain direction if there is one.

```sig
sprites.create(null).obstacle(CollisionDirection.Left)
```
## Parameters

* **direction**: the direction to get an obstacle sprite from.

## Returns

* a [sprite](/types/sprite) which is an obstacle in the direction chosen.

## Example #example

Send a sprite in the direction of an obstacle. Whena the obstacle is detected, move it up and keep going. Also, keep putting the obstacle back to it's original location in a separate game update block.

```blocks
let obs: Image = null
let box: Image = null
let startY = 0
let putObs: Sprite = null
let goBox: Sprite = null
box = image.create(32, 32)
box.fill(7)
obs = image.create(32, 32)
obs.fill(10)
goBox = sprites.create(box)
goBox.x = 8
putObs = sprites.createObstacle(obs)
startY = putObs.y
game.onUpdateInterval(4000, function () {
    putObs.y = startY
})
game.onUpdate(function () {
    goBox.vx = 50
    if (goBox.hasObstacle(CollisionDirection.Right)) {
        goBox.obstacle(CollisionDirection.Right).y -= 1
    }
    if (goBox.x > scene.screenWidth() + 16) {
        goBox.x = -16
    }
})
```

## See also #seealso

[has obstacle](/reference/sprites/sprite/has-obstacle),
[create obstacle](/reference/sprites/sprite/create-obstacle),
[on collision](/reference/sprites/sprite/on-collision)