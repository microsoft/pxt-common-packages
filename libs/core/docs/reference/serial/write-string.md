# write String

Write a string to the serial port but don't start a new line.

```sig
serial.writeString("");
```
Just the text of the string is written to the serial port. The next time text is written,
it will be on the same line that this text is on. The text is written without making
a new line.

## Parameters

* **text**: the [string](/types/string) to write to the serial port

## Example

Writes the word `JUMBO` to the serial port a bunch of times, without any new lines.

```blocks
loops.forever(() => {
    serial.writeString("JUMBO");
    loops.pause(1000);
});
```

## See also

[``||write line||``](/reference/serial/write-line),
[``||write number||``](/reference/serial/write-number),
[``||write value||``](/reference/serial/write-value)
