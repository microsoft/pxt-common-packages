# Serial Write String

Write a string to the Serial port, without starting a new line afterward.

```sig
serial.writeString("");
```

### Parameters

* `text` is the [string](/types/string) to write to the serial port

### Example: simple serial

This program writes the word `JUMBO` to the serial port repeatedly,
without any new lines.

```blocks
loops.forever(() => {
    serial.writeString("JUMBO");
    control.pause(1000);
});
```

### See also

[serial write line](/reference/serial/write-line),
[serial write number](/reference/serial/write-number),
[serial write value](/reference/serial/write-value)
