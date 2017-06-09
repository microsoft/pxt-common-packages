# on Switch Moved

Do something when the slide switch is moved left or right.

```sig
input.onSwitchMoved(SwitchDirection.Left, () => {

})
```
## Parameters

* **direction**: the direction the switch was moved, either `left` or `right`.
* **handler**: the code to run when the switch is moved.

## Example #exsection

Use two ``||on switch moved||`` events for `left` and `right`. Make a photon move in opposite directions
when the switch is moves from one side to the other.

```blocks
light.pixels.setAll(Colors.Red)
input.onSwitchMoved(SwitchDirection.Right, () => {
    for (let i = 0; i < light.pixels.length(); i++) {
        light.pixels.photonForward(1)
        loops.pause(50)
    }
    light.pixels.photonFlip()
})
input.onSwitchMoved(SwitchDirection.Left, () => {
    for (let i = 0; i < light.pixels.length(); i++) {
        light.pixels.photonForward(1)
        loops.pause(50)
    }
    light.pixels.photonFlip()
})
```

## See also

[``||on event||``](/reference/input/button/on-event)

```package
input
```