# write Buffer

Write a buffer to the serial communication port.

```sig
serial.writeBuffer(pins.createBuffer(0));
```
Information in a buffer is sent out the serial port with ``||serial:write buffer||``. This is used
when you want to send information that is more complex and not just simple text or a number.

## Parameters

* **buffer**: the buffer to write to the serial port

## Example #example

Set some special data values in a buffer and send the buffer across the serial connection.

```blocks
let sdv = pins.createBuffer(4)
sdv.setNumber(NumberFormat.Int8LE, 0, 53)
sdv.setNumber(NumberFormat.Int8LE, 1, 141)
sdv.setNumber(NumberFormat.Int8LE, 2, 9)
sdv.setNumber(NumberFormat.Int8LE, 3, 87)
serial.writeBuffer(sdv);
```

## See also #seealso

[write line](/reference/serial/write-line),
[write number](/reference/serial/write-number)

```package
serial
```