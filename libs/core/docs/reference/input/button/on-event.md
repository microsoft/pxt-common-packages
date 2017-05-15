# on Event

Run some code when a button (``A``, ``B``, or both ``A`` + ``B``) is clicked, double clicked, or has some other action.

```sig
input.buttonA.onEvent(ButtonEvent.Click, () => {

})
```
## Parameters

* ``ev`` the button action to run some code for. The button actions (events) are:
> * ``click``: button was clicked (pressed and released)
> * ``double click``: button is clicked two times really fast (pressed and released, twice but quickly)
> * ``long click``: button is pressed and released after being held down for a long time, like one second or longer
> * ``up``: button is released from just being pressed
> * ``down``: button is just pressed down
> * ``held``: button was pressed and is still pressed
* ``body`` the code you want to run when something happens with a button

## Examples #exsection

### Next light please #ex1

In this example, the lighted pixel moves to the next pixel spot each time you press the `A` button. The postition of
the light goes back to first pixel when the current position reaches the last pixel.

```blocks
let position = 0
input.buttonA.onEvent(ButtonEvent.Click, () => {
    if (position > -1) {
        light.pixels.setPixelColor(position - 1, Colors.Black)
    }
    if (position == light.pixels.length()) {
        position = 0
    }
    light.pixels.setPixelColor(position, Colors.Red)
    position += 1
})
```

### Any color, any pixel #ex2

Wnen the ``B`` button is released, light up a random pixel with a random color.

```blocks
let anyPixel = 0
input.buttonB.onEvent(ButtonEvent.Up, () => {
    light.pixels.clear()
    anyPixel = Math.random(light.pixels.length())
    light.pixels.setPixelColor(anyPixel, Math.random(Colors.White))
})
```

### See also

[``||is pressed||``](/reference/input/button-is-pressed),
[``||was pressed||``](/reference/input/button/was-pressed),
[``||random||``](/blocks/math#random-value)
