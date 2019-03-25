# set Enabled

Turn data logging on or off.

```sig
datalogger.setEnabled(false)
```

## Parameters

* **enabled**: a [boolean](/types/boolean) value that is `true` to turn data logging on or `false` to turn data logging off.

## Example #example

Create log file rows with random `x`, `y`, and, `z` values. Write just one a data sample to the log for each `50` milliseconds.

```blocks
datalogger.setEnabled(true)
datalogger.setSampleInterval(50)
forever(function () {
    datalogger.addValue("x", Math.randomRange(0, 10))
    datalogger.addValue("y", Math.randomRange(0, 10))
    datalogger.addValue("z", Math.randomRange(0, 10))
    datalogger.addRow()
    pause(10)
})
```

## See also #seealso

[set sample interval](/reference/datalogger/set-sample-interval)

```package
datalogger
```
