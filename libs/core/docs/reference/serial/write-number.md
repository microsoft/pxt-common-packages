# write Number

Write a number to the serial port.

```sig
serial.writeNumber(0);
```
The number you send is turned into a string before it's sent. So, a value like ``1023``
is a the four character string of ``"1023"`` when it's sent across the serial
connection. The number is written as part of the current line and a new line isn't
started when it's finished.

## Parameters

* **value**: the [number](/types/number) to write to the serial port

## Example

Write a 10-digit number to the serial port many, many times.

```blocks
loops.forever(() => {
    serial.writeNumber(1234567890);
    loops.pause(5000);
});
```

## See also

[``||write line||``](/reference/serial/write-line),
[``||write value||``](/reference/serial/write-value)

