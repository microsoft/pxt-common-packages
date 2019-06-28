# add Value

Add a value to the current row of the data log file.

```sig
datalogger.addValue("x", 0)
```

A data value is part of a row of values that will get written to the log file. The values added are named pairs and are placed to a row from left to right as comma separated values (CSV). They will appear in the log file like this:

```
time (s) x   y   z
45  5   9   34
46  67  98  71
47  73  4   82
```

The first value in a row is the _sample_ time which is the time that the row is written to the log. The names of the values are in the first row, the header row, and the actual values are in the rows after that.

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

[add row](/reference/datalogger/add-row)

```package
datalogger
```
