# screen Width

Get the width in pixels of the screen.

```sig
scene.screenWidth()
```

## Returns

* a [number](/types/number) that's the width of the screen on the game device or simulator.

## Example #example

Draw a wide line across the entire screen.

```blocks
let showLine: Sprite = null
let wideLine: Image = null
wideLine = image.create(scene.screenWidth(), 3)
wideLine.fill(5)
showLine = sprites.create(wideLine)
```

## See also #seealso

[screen height](/refernece/scene/height)

