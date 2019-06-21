# set Sample Interval

Set how often to write a row of data to the log file.

```sig
datalogger.setSampleInterval(50)
```

If you only want to log some data only once during an interval of time, you can set the _sample_ interval. A sample is a snapshot of information at a particular moment.

As an example, if you're collecting data very quickly, say every 10 milliseconds, that might create more data than you wish to keep in the log. You could set the sample interval to 50 millisecond so that only one of the 5 samples (a row of data) collected during the 50 milliseconds is actually written to the log.

## Parameters

* **millis**: the [number](/types/number) milliseconds between each time a sample (row) is written to the data log file.

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

[add row](/reference/datalogger/add-row)

```package
datalogger
```
