# Serial Write Number

Write a number to the Serial port.

```sig
serial.writeNumber(0);
```

### Parameters

* `value` is the [number](/types/number) to write to the serial port

### Example: one through ten

This program repeatedly writes a 10-digit number to the serial port.

```blocks
loops.forever(() => {
    serial.writeNumber(1234567890);
    control.pause(5000);
});
```

### #examples

### See also

[serial write line](/reference/serial/write-line),
[serial write value](/reference/serial/write-value)

