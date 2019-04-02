# set Baud Rate

Set the baud rate for transmitting and recieving serial data.

```sig
serial.setBaudRate(BaudRate.BaudRate115200)
```

The _baud rate_, or the serial data rate, is set to the same rate as the device that your board is connected to. This allows each side of the connection to know when to read each bit of data sent and when a full group of bits (usually 8 bits) is received.

## ~ hint

The data rate of the serial connection is set as the number of data signals that the connection makes each second. Usually this is the number of data _bits_ sent each second. For simple 8 bit data, like text characters, this means that for a data rate of `9600`, 1200 characters can be sent or received every second. Sometimes an addtional data signal or two are needed to transmit those 8 bits of a character, so fewer charaters are sent each second. This doesn't make the actual data rate change but the bits per second (bps) of data that your program sees will be reduced some. Historically the serial data rate has been called the connection _baud rate_.

## ~

## Parameters

* **rate**: the data rate (baud rate) to send and receive data at. This value is set from the list on the block and is one of the values in the ``BaudRate`` enumeration.

## Example #example

Set the serial data baud rate to `19200`.

```blocks
serial.setBaudRate(BaudRate.BaudRate19200)
```

## See also #seealso

[redirect](/reference/serial/redirect)

```package
serial
```