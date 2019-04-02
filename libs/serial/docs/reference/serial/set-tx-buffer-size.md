# set Tx Buffer Size

Set the size of the serial data transmit buffer.

```sig
serial.setTxBufferSize(0)
```

You can set the size of the transmit buffer for the serial connection. If your program writes data faster than the serial connection can transmit it, the data will fill temporarily into the buffer until it's sent out. If the buffer fills up because it wasn't transmitted fast enough, the oldest data in the buffer is discarded to make room for the newer data.

If you are frequently writing a small amount of data, you can set the buffer to a small size to conserve memory on your board.

## Paramters

* **size**: a [number](/types/number) of bytes (8 bits of data) to set for the transmit buffer.

## Example #example

Set the transmit buffer size to `40`. Write a string that fits into the transmit buffer.

```blocks
serial.setTxBufferSize(40)
serial.writeString("Send me out. I'm not too big for the buffer.")
```

## See also #seealso

[set rx buffer size](/reference/serial/set-rx-buffer-size)

```package
serial
```