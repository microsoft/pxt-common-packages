# screen Height

Get the height in pixels of the screen.

```sig
scene.screenWidth()
```

## Returns

* a [number](/types/number) that's the height of the screen on the game device or simulator.

## Example #example

Draw a wide line down the entire screen.

```blocks
let showLine: Sprite = null
let wideLine: Image = null
wideLine = image.create(3, scene.screenHeight())
wideLine.fill(5)
showLine = sprites.create(wideLine)
```

## See also #seealso

[screen width](/refernece/scene/width)

