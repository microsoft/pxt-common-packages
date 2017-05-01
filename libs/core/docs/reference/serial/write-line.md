# Serial Write Line

Write a string to the Serial port and start a new line of text
by writing `\r\n`.

```sig
serial.writeLine("");
```

### Parameters

* `text` is the [string](/types/string) to write to the serial port

### Example: simple serial

This program writes the word `BOFFO` to the serial port repeatedly.

```blocks
control.forever(() => {
    serial.writeLine("BOFFO");
    control.pause(5000);
});
```

### #examples

### See also

[serial write number](/reference/serial/write-number),
[serial write string](/reference/serial/write-string),
[serial write value](/reference/serial/write-value)
