# background Color

Get the background color of the screen.

```sig
scene.backgroundColor()
```

You can get the background color of the screen anytime. The background color is always behind other images shown on the screen.

## Returns

* a [number](/types/number) which is the the color set as the screen background color.

## Example #example

Show a purple square on the screen. Every second, switch the background color between light and dark.

```blocks
let showSquare: Sprite = null
let purpleSquare: Image = null
let toggle = false
toggle = true
purpleSquare = image.create(32, 32)
purpleSquare.fill(11)
showSquare = sprites.create(purpleSquare)
game.onUpdateInterval(1000, function () {
    scene.setBackgroundColor((scene.backgroundColor() + 1) % 2) //toggle between 0 and 1

})
```

## See also #seealso

[set background color](/reference/scene/set-background-color)