# panic

Display an error number and stop the program.

```sig
control.panic(0)
```

If your board has some way to display error information, ``||panic||`` will work
with it to show error numbers.

Your program stops when you use ``||panic||``. Use this when you think something bad enough has
happened and your program can't run properly anymore.

## Parameters

* **code**: an error [number](/types/number) you match to an error situation in your program.

## Example

Send a 'code red' error that you created to the error display if the input from pin `A0` is
lower than `10`.

```blocks
let codeRed = 1
let codeBlue = 2

if (pins.A0.analogRead() < 10) {
    control.panic(codeRed)
}
```

## See also

[assert](/reference/control/assert)