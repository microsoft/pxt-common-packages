# set Rx Buffer Size

Set the size of the serial data receive buffer.

```sig
serial.setRxBufferSize(0)
```

You can set the size of the receive buffer for the serial connection. If data is received faster than your program reads it, the data will fill temporarily into the buffer until it's read. If the buffer fills up because your program doesn't read it or doesn't read it fast enough, the oldest data in the buffer is discarded to make room for the newer data received.

You can set a buffer size that works best for how your program wants to read in data. Setting the size is also useful if you want a read a certain amount of incoming data with an [on rx buffer full](/reference/serial/on-event) event. If you are frequently reading a small amount of data, you can set the buffer to a small size to conserve memory on your board.

## Paramters

* **size**: a [number](/types/number) of bytes (8 bits of data) to set for the receive buffer.

## Example #example

Set the receive buffer size to `80`. Read all of the data in the receive buffer when it fills up.

```blocks
let myChars = ""
serial.setRxBufferSize(80)
serial.onEvent(SerialEvent.RxBufferFull, function () {
    myChars = serial.readString()
})
```

## See also #seealso

[set tx buffer size](/reference/serial/set-tx-buffer-size),
[on event](/reference/serial/on-event)

```package
serial
```