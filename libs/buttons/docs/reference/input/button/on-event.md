# on Event

Run some code when a button (``A``, ``B``, or both ``A`` + ``B``) is clicked, double clicked, or has some other action.

```sig
input.buttonA.onEvent(ButtonEvent.Click, () => {

})
```

## ~hint
**Touch**

If your board has pins or pads that work as touch inputs, then your code can use them just like buttons.
Instead of saying `button A` or `button B` as the input source, use a pin name like `pin A1`.

```block
let pixels = light.createStrip();
input.pinA1.onEvent(ButtonEvent.Down, function() {
    pixels.setPixelColor(1, 0x0000ff)
})
```

Read about [**touch sensors**](/reference/input/button/touch-sensors) and using the pins as touch buttons.
## ~

## Parameters

* ``ev`` the button action to run some code for. The button actions (events) are:
> * ``click``: button was clicked (pressed and released)
> * ``double click``: button is clicked two times really fast (pressed and released, twice but quickly)
> * ``long click``: button is pressed and released after being held down for a long time, like one second or longer
> * ``up``: button is released from just being pressed
> * ``down``: button is just pressed down
> * ``held``: button was pressed and is still pressed
* ``body`` the code you want to run when something happens with a button

## Examples #example

### Next light please #ex1

In this example, the lighted pixel moves to the next pixel spot each time you press the `A` button. The position of
the light goes back to first pixel when the current position reaches the last pixel.

```blocks
let position = 0;
let pixels = light.createStrip();

input.buttonA.onEvent(ButtonEvent.Click, function() {
    if (position > -1) {
        pixels.setPixelColor(position - 1, 0x000000);
    }
    if (position == pixels.length()) {
        position = 0;
    }
    pixels.setPixelColor(position, 0xff0000);
    position += 1;
})
```

### Any color, any pixel #ex2

Wnen the ``B`` button is released, light up a random pixel with a random color.

```blocks
let anyPixel = 0;
let pixels = light.createStrip();
input.buttonB.onEvent(ButtonEvent.Up, function() {
    pixels.clear();
    anyPixel = Math.randomRange(0, pixels.length());
    pixels.setPixelColor(anyPixel, Math.randomRange(0, 0xffffff));
})
```

### Touch down #ex3

Make a pixel turn `pink` when you touch the capacitive pin `pin A1` on the board. The pixel then turns
`green` when you lift your finger off of the pin.

```blocks
let pixels = light.createStrip();

input.pinA1.onEvent(ButtonEvent.Down, () => {
    pixels.setPixelColor(5, 0xff007f);
})
input.pinA1.onEvent(ButtonEvent.Up, () => {
    pixels.setPixelColor(5, 0x00ff00);
})
```

## See also #seealso

[is pressed](/reference/input/button/is-pressed),
[was pressed](/reference/input/button/was-pressed),
[random](/blocks/math#random-value)

[Touch sensors](/reference/input/button/touch-sensors)
