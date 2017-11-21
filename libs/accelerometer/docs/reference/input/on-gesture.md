# on Gesture

Run some code when you perform a **gesture**, like shaking the @boardname@.

```sig
input.onGesture(Gesture.Shake,() => {
})
```

### Parameters

* ``gesture``: the gesture to detect. A gesture is the way you hold or move the @boardname@. Gestures are:
> * `shake`: shake the board
> * `logo up`: the logo is facing up
> * `logo down`: the logo is facing down
> * `screen up`: the screen side is up
> * `screen down`: the screen side is down
> * `tilt left`: the board is tilted to the left
> * `tilt right`: the board is tilted to the right
> * `free fall`: the board is falling for a distance
> * `3g`: acceleration force of 3 g
> * `6g`: acceleration force of 6 g
* ``body``: code to run when the gesture event occurs

### Example: random number #example

Show a random color when you shake the @boardname@.

```blocks
let pixels = light.createStrip();
input.onGesture(Gesture.Shake,() => {
    pixels.setAll(light.hsv(Math.randomRange(0, 256), 255, 127));
})
```

```package
accelerometer
```