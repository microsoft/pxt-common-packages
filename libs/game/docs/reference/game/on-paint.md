# on Paint

Draw on screen before sprites.

```sig
game.onPaint(function () {
	
})
```

## Parameters

* **a**: the code to run for painting the screen before the sprites are drawn.

## Example #example

Randomly change the screen background color every `2` seconds.

```blocks
let bkColor = 0
bkColor = 0
game.onPaint(function () {
    scene.setBackgroundColor(bkColor)
})
game.onUpdateInterval(2000, function () {
    bkColor = Math.randomRange(0, 15)
})
```

## See also #seealso

[update](/reference/game/on-update)