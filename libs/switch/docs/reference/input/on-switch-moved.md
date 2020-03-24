# on Switch Moved

Do something when the slide switch is moved left or right.

```sig
input.onSwitchMoved(SwitchDirection.Left, function() {

})
```
## Parameters

* **direction**: the direction the switch was moved, either `left` or `right`.
* **handler**: the code to run when the switch is moved.

## Example #example

Use two ``||input:on switch moved||`` events for `left` and `right`. Log a message
telling which position the switch is in.

```blocks
input.onSwitchMoved(SwitchDirection.Right, function() {
    console.log("Switch Right")
})
input.onSwitchMoved(SwitchDirection.Left, function() {
    console.log("Switch Left")
})
```

## See also #seealso

[on event](/reference/input/button/on-event)

```package
input
```