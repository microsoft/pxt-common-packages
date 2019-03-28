# set Separator

Set the log value separator charactor.

```sig
datalogger.setSeparator(LogSeparator.Tab)
```

A special character is used to separate the values in the rows that are written to the log file. The default separator is the TAB character, ``\t``. The text format of the data values in a row using a tab separator might look like:

```
time (s) x   y   z
45  5   9   34
46  67  98  71
47  73  4   82
```

You can change the separator to something else if you have a program or application that uses a different character to read each value from a row. The same data from the previous example written to the log file using a comma separator appears this way:

```
time (s),x,y,z
45,5,9,34
46,67,98,71
47,73,4,82
```

## Parameters

* **separator**: the text character used to separate the values in a row of data in the log file. The separator characters to choose from are `tab ('    ')`, `comma (',')`, or `semicolon (';')`.

## Example #example

Create log file rows with random `x`, `y`, and, `z` values. Use a comma as the value separator.

```blocks
datalogger.setEnabled(false)
datalogger.setSeparator(LogSeparator.Comma)
datalogger.setEnabled(true)
datalogger.sendToConsole(true)
forever(function () {
    datalogger.addValue("x", Math.randomRange(0, 10))
    datalogger.addValue("y", Math.randomRange(0, 10))
    datalogger.addValue("z", Math.randomRange(0, 10))
    datalogger.addRow()
    pause(500)
})
```

## See also #seealso

[add value](/reference/datalogger/add-value)

```package
datalogger
```
