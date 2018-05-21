# overlaps With

Check if this sprite is overlapping another sprite.

```sig
sprites.create(null).overlapsWith(null)
```

## Parameters

* **other**: the other sprite to check for overlap with this sprite.

## Returns

* a [boolean](/types/boolean) value which is ``true`` if the other sprite is overlapping this sprite.

## Example #example

Send a blue square toward a red square. While the red square is overlapping the blue square, randomly change the color of the "red" square to something else.

```blocks
let redBox: Image = null
let blueBox: Image = null
let blueBoxStay: Sprite = null
let redBoxStay: Sprite = null
blueBox = image.create(32, 32)
blueBox.fill(4)
redBox = image.create(32, 32)
redBox.fill(10)
blueBoxStay = sprites.create(blueBox)
redBoxStay = sprites.create(redBox)
blueBoxStay.x = 0
blueBoxStay.vx = 10
game.onUpdateInterval(100, function () {
    if (redBoxStay.overlapsWith(blueBoxStay)) {
        redBox.fill(Math.randomRange(1, 15))
    }
})
```

## See also #seealso

[on overlap](/reference/sprites/sprite/on-overlap)
