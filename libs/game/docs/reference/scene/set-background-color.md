# set Background Color

Set the background color of the screen.

```sig
scene.setBackgroundColor(0)
```

You can set the background color of the screen at anytime. The background color is always behind other images shown on the screen.

### ~ hint

#### Color number

There are 16 colors available to choose from. These colors are set in the current color _pallete_.
The pallete contains a collection of colors, each of which have an index number from `0` to `15`. The index
is also known as the **color number**. Unless the pallete is changed, the pallete has these colors as the
default:

* `0`: transparent
* `1`: white
* `2`: light blue
* `3`: medium blue
* `4`: dark blue
* `5`: violet
* `6`: lime
* `7`: olive
* `8`: brown
* `9`: cyan
* `10`: red
* `11`: purple
* `12`: pink
* `13`: orange
* `14`: yellow
* `15`: black

### ~

## Parameters

* **color**: the [number](/types/number) for the color to set as the background color of the screen.

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