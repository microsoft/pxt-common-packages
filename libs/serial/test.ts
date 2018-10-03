let i = 0;
forever(function () {
    serial.writeLine((++i).toString())
})