# millis

Get the number of seconds of time passed since the board was turned on or last reset.

```sig
control.seconds()
```

## Returns

* the [number](/types/number) of seconds of time since the board was reset.

## Example #example

Find how many days, hours, minutes, and seconds the @boardname@ has been running.

```blocks
let seconds = control.seconds()
let mins = seconds / 60
let hours = mins / 60
let days = hours / 24
```

## #seealso