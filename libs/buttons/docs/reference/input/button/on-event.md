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
input.pinA1.onEvent(ButtonEvent.Down, function() {
    console.log("Press down")
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

### Button release #ex1

Wnen the ``B`` button is released, log a message.

```blocks
input.buttonB.onEvent(ButtonEvent.Up, function() {
    console.log("Release button")
})
```

### Touch down #ex2

Log a message when you touch or release the capacitive pin `pin A1` on the board.

```blocks
input.pinA1.onEvent(ButtonEvent.Down, function() {
    console.log("Touch pin")
})
input.pinA1.onEvent(ButtonEvent.Up, function() {
    console.log("Release pin")
})
```

## See also #seealso

[is pressed](/reference/input/button/is-pressed),
[was pressed](/reference/input/button/was-pressed),
[random](/blocks/math#random-value)

[Touch sensors](/reference/input/button/touch-sensors)
