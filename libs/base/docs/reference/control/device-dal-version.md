# device Dal Version

Get the version information for the system software on the @boardname@.

```sig
control.deviceDalVersion()
```

## Returns

* a [string](/types/string) that represents the version of the system software (DAL) on the board.

## Example #example

Write the system software version to the serial port.

```blocks
serial.writeLine("DAL version = " + control.deviceDalVersion());
```

## See also #seealso

[device serial number](/reference/control/device-serial-number)
