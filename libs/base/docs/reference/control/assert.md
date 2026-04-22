# assert

If a condition is false, stop the program and display an error message along with an error code.

```sig
control.assert(false, 0)
```

You can insist that your program will stop at an **assert** block if a certain condition you check is false. 
An 'Assertion failed' message containing the error code number is generated. This message is shown in the problems panel and also output to the the serial port. The format of the message looks like this:

``Fatal failure: Assertion failed, code=49``

## Parameters

* **cond**: a [boolean](/types/boolean) where `true` means everything is ok or `false` which means, stop the program!
* **code**: an error [number](/types/number) you match to an error situation in your program.

## Example 

Stop the program if a sensor connected to pin `A0` sends a low (`0`) signal.

```blocks
forever(function () {
    control.assert((pins.A0.digitalRead() == 1), 15)
    pause(1000)
})
```

## See also 

[panic](/reference/control/panic)

```package
base
```
