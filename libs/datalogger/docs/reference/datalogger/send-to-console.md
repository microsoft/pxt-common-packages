# send To Console

Send rows of log data to the console.

```sig
datalogger.sendToConsole(false)
```

When data logging is enabled in your program, you can have each row that is written to the log go to the console too.

## Parameters

* **enabled**: a [boolean](/types/boolean) value that is `true` to send rows of log data to the console or `false` to write them to the log file only.

## Example #example

Create log file rows with random `x`, `y`, and, `z` values. Send each row to the console too.

```blocks
datalogger.setEnabled(true)
datalogger.sendToConsole(true)
forever(function () {
    datalogger.addValue("x", Math.randomRange(0, 10))
    datalogger.addValue("y", Math.randomRange(0, 10))
    datalogger.addValue("z", Math.randomRange(0, 10))
    datalogger.addRow()
    pause(100)
})
```

## See also #seealso

[set enabled](/reference/datalogger/set-enabled),
[add row](/reference/datalogger/add-row),
[set sample interval](/reference/datalogger/set-sample-interval)

```package
datalogger
```
