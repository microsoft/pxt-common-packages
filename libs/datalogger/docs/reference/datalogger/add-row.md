# add Row

Save the current row of values to the data log file and initialize a new row.

```sig
datalogger.addRow()
```

A row of data log information is a collection of individual named data values. The data log is a comma separated value (CSV) file on the board or device running your program. If, for example, you are saving values for positions in space:

```block
datalogger.addValue("x", Math.randomRange(0, 100))
datalogger.addValue("y", Math.randomRange(0, 100))
datalogger.addValue("z", Math.randomRange(0, 100))
datalogger.addRow()
```

The rows in your log file will contain data like this:

```
time (s) x   y   z
45  5   9   34
46  67  98  71
47  73  4   82
```

The first row is the header row. Every row has the time that the row is written as the first value. This is placed in there for you automatically. The other parts of header are the names of the values you put in the row with ``||datalogger:datalogger add||``.

The rest of the rows contain the values you added along with the _sample_ time (the time the row is written) as the first value.

## ~ hint

A comma separated value (CSV) file is the general name for a data file written as text with the values on each row separated by a delimiter character. Besides using a comma as a delimiter, other common delimiters are spaces, tabs, and semi-colons.

## ~

## Example #example

Create log file rows with random `x`, `y`, and, `z` position values. Pause `500` milliseconds before writing each row.

```blocks
datalogger.setEnabled(true)
forever(function () {
    datalogger.addValue("x", Math.randomRange(0, 10))
    datalogger.addValue("y", Math.randomRange(0, 10))
    datalogger.addValue("z", Math.randomRange(0, 10))
    datalogger.addRow()
    pause(500)
})
```

## See also #seealso

[add value](/reference/datalogger/add-value),
[set enabled](/reference/datalogger/set-enabled)

```package
datalogger
```
