# redirect

Redirect serial data to go through the pins instead of using the USB connection.

```sig
serial.redirect(pins.A0, pins.A0, BaudRate.BaudRate115200)
```

By default, the serial data is sent and received over a USB connection to your board. If you want to change it to transmit and receive through the pins, you can redirect the connection to them instead. You choose which two pins to use for the transmit and recieve lines. Also, you set the data rate (baud rate) for the redirected connection.

## ~ hint

The data rate of the serial connection is set as the number of data signals that the connection makes each second. Usually this is the number of data _bits_ sent each second. For simple 8 bit data, like text characters, this means that for a data rate of `9600`, 1200 characters can be sent or received every second. Sometimes an addtional data signal or two are needed to transmit those 8 bits of a character, so fewer charaters are sent each second. This doesn't make the actual data rate change but the bits per second (bps) of data that your program sees will be reduced some. Historically the serial data rate has been called the connection _baud rate_.

## ~

## Parameters

* **tx**: the pin set to transmit serial data. This is one of the digital pins on the board.
* **rx**: the pin set to receive serial data. This is one of the digital pins on the board.
* **rate**: the data rate (baud rate) to send and receive data at. This value is set from the list on the block and is one of the values in the ``BaudRate`` enumeration.

## Example #example

Set the transmit and receive buffer sizes. Redirect the serial connecton to pins **A0** and **A1**.

```blocks
serial.setTxBufferSize(64)
serial.setRxBufferSize(64)
serial.redirect(pins.A0, pins.A1, BaudRate.BaudRate115200)
```

## See also #seealso

[attach to console](/reference/serial/attach-to-console),
[set baud rate](/reference/serial/set-baud-rate)

```package
serial
```