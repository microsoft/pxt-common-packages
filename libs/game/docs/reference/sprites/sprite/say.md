# say

Display a caption with some text near a sprite.

```sig
sprites.create(null).say("")
```

Sometimes you may want to have a message show up for a sprite. You can have a caption with a text string appear next to sprite and have it say something to the player.

## Parameters

* **text**: a [string](/types/string) that contains the text of the caption.
* **millis**: an optional [number](/types/number) of milliseconds to display the caption for.

## Example #example

Send a sprite toward a barrier. When it contacts the barrier, have it bounce back to its starting position and show the `"Bounce!"` caption.

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
greenBoxGo.onCollision(CollisionDirection.Right, function (wall) {
    greenBoxGo.x = 16
    greenBoxGo.say("Bounce!", 400)
})
```

## #seealso
