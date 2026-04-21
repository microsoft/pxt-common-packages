# device Long Serial Number

Get the long (64-bit) serial number for the @boardname@

```sig
control.deviceSerialNumber()
```

The system software in your board creates a unique number to identify the board. You can use this number in your program if you want to know which board is running your program.

## Returns

* a [buffer](/types/buffer) that contains a 64-bit value to uniquely identify this board.

## Example #example

Write the board's long serial number to the serial port as a Base64 string.

```blocks
console.log("serialnumber: " + control.deviceLongSerialNumber().toBase64())
```

## See also #seealso

[device dal version](/reference/control/device-dal-version),
[device serial number](/reference/control/device-serial-number)