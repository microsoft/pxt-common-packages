# on Delimeter Received

Run some code when a delimiter character is received.

```sig
serial.onDelimiterReceived(Delimiters.NewLine, function () {})
```

The end of of a line of text, a sequence of command characters, and other messages are often signalled by a special character. This character is called a _delimiter_. Common delimeter characters are spaces, tabs, commas, and newlines. You can watch for a delimiter and then have your program process data you've already received when the delimiter arrives on the serial connection.

## Parameters

* **delimiter**: the delimiter character to watch for. Choose a character from the list on the block. In JavaScript, the character value is in the ``Delimiters`` enumeration.
* **handler**: the code to run when the delimiter is received.

### Example #example

Read a string of characters when the newline delimiter is received.

```blocks
let myLine = ""
serial.onDelimiterReceived(Delimiters.NewLine, function () {
    myLine = serial.readString()
})
```

## See also #seealso

[on event](/reference/serial/on-event),
[read string](/reference/serial/read-string)

```package
serial
```