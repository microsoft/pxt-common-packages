let k = 0;
forever(function () {
    datalogger.addRow()
    datalogger.addValue("x", k)
    datalogger.addValue("y", 1 / k)
})
