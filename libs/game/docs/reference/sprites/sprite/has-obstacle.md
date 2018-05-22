# has Obstacle

Check if there is an obstacle in one of the directions from the sprite.

```sig
sprites.create(null).hasObstacle(CollisionDirection.Left)
```

## Parameters

* **direction**: the direction to check for obstacles in.

## Returns

* a [boolean](/types/boolean) value which is ``true`` if an obstacle is in the chosen direction. If not, then ``false`` is returned.

## Example #example

Make a sprite move toward an obstacle. When the obstacle is detected, move down to avoid it and keep going!

```blocks
let putObs: Sprite = null
let startY = 0
let goBox: Sprite = null
let obs: Image = null
let box: Image = null
box = image.create(32, 32)
box.fill(7)
obs = image.create(32, 32)
obs.fill(10)
goBox = sprites.create(box)
goBox.x = 8
startY = goBox.y
putObs = sprites.createObstacle(obs)
goBox.ax = 10
game.onUpdate(function () {
    if (goBox.hasObstacle(CollisionDirection.Right)) {
        goBox.y += 1
    }
    if (goBox.x > scene.screenWidth() + 16) {
        goBox.x = -16
        goBox.y = startY
    }
})
```

## See also #seealso

[obstacle](/reference/sprites/sprite/obstacle),
[on collision](/reference/sprites/sprite/on-collision),
[create obstacle](/reference/sprites/sprite/create-obstacle)