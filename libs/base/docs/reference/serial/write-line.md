# write Line

Write a line of text to the serial port.

```sig
serial.writeLine("");
```

A line of text is string that has two special characters added at the end: _carriage return_
and _line feed_. These characters are really just codes that mean start a new line.
Sometimes they appear in code as ``"\r\n"``. 

After using a ``||write line||``, any new text written to the serial port will begin on a new line.

With ``||write line||``, the new line characters are automatically added for you. You only need to 
give the text you want to write.

## Parameters

* **text**: the [string](/types/string) to write to the serial port

## Example

Write two greeting messages to the serial port.

```blocks
serial.writeLine("How are you today?");
loops.pause(5000);
serial.writeLine("Well that's great! I'm doing well too.");
```

## See also

[``||write number||``](/reference/serial/write-number),
[``||write string||``](/reference/serial/write-string),
[``||write value||``](/reference/serial/write-value)
