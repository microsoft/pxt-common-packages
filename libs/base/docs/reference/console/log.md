# log

Write a line of text to the console output.

```sig
console.log("");
```

A line of text is a string that has two special characters added at the end: _carriage return_
and _line feed_. These characters are really just codes that mean start a new line.
Sometimes they appear in code as ``"\r\n"``.

After using ``||console:log||``, any new text written to the console output will begin on a new line.

With ``||console:log||``, the new line characters are automatically added for you. You only need to give the text you want to write.

## Parameters

* **text**: the [string](/types/string) to write to the console output.

## Example #example

Write two greeting messages to the console output.

```blocks
console.log("How are you today?");
pause(5000);
console.log("Well that's great! I'm doing well too.");
```

## See also #seealso

[log value](/reference/console/log-value)