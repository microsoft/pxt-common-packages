let k = 0;
forever(function () {
    datalog.addRow()
    datalog.addValue("x", k)
    datalog.addValue("y", 1 / k)
})
