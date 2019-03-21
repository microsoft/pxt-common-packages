# read Line

Read the buffered serial data as a line of text characters.

```sig
serial.readLine();
```

Data is read from the serial receive buffer as a string, or line of text, until a newline delimiter is found. The string returned includes the newline character.

## Returns

* a [string](/types/string) containing a line of text received from the serial port. The string is empty if no data is available.

## See also #seealso

[read string](/reference/serial/read-string)
[write line](/reference/serial/write-line),

```package
serial
```