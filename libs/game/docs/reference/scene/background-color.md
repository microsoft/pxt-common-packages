# background Color

Get the background color of the screen.

```sig
scene.backgroundColor()
```

The background color is the color painted behind other images shown on the screen.

### ~ hint

#### Color number

There are 16 colors available to choose from. These colors are set in the current color _pallete_.
The pallete contains a collection of colors, each of which have an index number from `0` to `15`. The index
is also known as the **color number**. Unless the pallete is changed, the pallete has these colors as the
default:

* `0`: transparent
* `1`: white
* `2`: red
* `3`: pink
* `4`: orange
* `5`: yellow
* `6`: teal
* `7`: green
* `8`: blue
* `9`: light blue
* `10`: purple
* `11`: light purple
* `12`: dark purple
* `13`: tan
* `14`: brown
* `15`: black

### ~

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