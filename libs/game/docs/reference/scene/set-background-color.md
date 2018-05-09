# set Background Color

Set the background color of the screen.

```sig
scene.setBackgroundColor(0)
```

You can set the background color of the screen anytime. The background color is always behind other images shown on the screen.

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
    if (toggle) {
        scene.setBackgroundColor(1)
    } else {
        scene.setBackgroundColor(0)
    }
    toggle = !(toggle)
})
```

## See also #seealso

[set background image](/reference/scene/set-background-image)