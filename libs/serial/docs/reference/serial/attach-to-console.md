# attach To Console

Direct the data written to the console to go out the serial connection also.

```sig
serial.attachToConsole()
```

When you attach the console to the serial transmit connection, any information you log to the console is  transmitted over the serial connection too.

## Example #example

Send some console log messages out through the serial connection.

```blocks
serial.attachToConsole()
console.log("Send this message to the serial connection")
console.logValue("SerialValue", 999)
```

## See also #seealso

[redirect](/reference/serial/redirect)

```package
serial
```
