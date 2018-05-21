# on Overlap

Run some code when a sprite overlaps with another sprite.

```sig
sprites.create(null).onOverlap(function (other: Sprite) {

})
```

If a sprite overlaps another sprite, you can run some code when it happens. The overlap is detected when any part of your sprite that isn't transparent overlaps some part of another sprite that als0 isn't transparent.

## Parameters

* **handler**: the code to run when an overlap with another sprite happens.
* **other**: the sprite to to check for an overlap.

## Example #example

Send a blue sprite toward a red sprite. When it overlaps thr red sprite, make it disappear.

```blocks
let blueBoxGo: Sprite = null
let redBox: Image = null
let blueBox: Image = null
let redBoxStay: Sprite = null
blueBox = image.create(32, 32)
blueBox.fill(4)
redBox = image.create(32, 32)
redBox.fill(10)
blueBoxGo = sprites.create(blueBox)
blueBoxGo.x = 16
redBoxStay = sprites.create(redBox)
redBoxStay.x = scene.screenWidth() - 16
blueBoxGo.vx = 10
blueBoxGo.onOverlap(function (redBoxStay) {
    blueBox.fill(0)
    blueBoxGo.vx = 0
})
```

## See also #seealso

[overlaps with](/reference/sprites/sprite/overlaps-with)
