# set Throttle

Emulate a joystick or gamepad throttle position from slow to fast.

```sig
gamepad.setThrottle(0, 0)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate gamepad actions. This function doesn't work in the simulator.

## ~

## Parameters

* **index**: a [number](/types/number) that is it index of the emulated gamepad, `0` or `1`.
* **value**: a throttle position [number](/types/number) that is from `0` (slow) to `31` (fast).

## Example #example

Simulate a setting the throttle up when button **A** is pressed and down when button **B** is pressed.

```blocks
let speed = 0
input.buttonA.onEvent(ButtonEvent.Click, function () {
    if (speed < 31) {
        speed += 1
        gamepad.setThrottle(0, speed)
    }
})
input.buttonB.onEvent(ButtonEvent.Click, function () {
    if (speed > 0) {
        speed += -1
        gamepad.setThrottle(0, speed)
    }
})
```

## Trying it out

You can use [HTML5 Gamepad](http://html5gamepad.com/) in your browser to test your code.

## See also #seealso

[set button](/reference/gamepad/set-button),
[move](/reference/gamepad/move)

```package
gamepad
```