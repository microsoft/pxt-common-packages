# Serial

Reading and writing data over a serial connection.

## Write

```cards
serial.writeLine("");
serial.writeNumber(0);
serial.writeValue("x", 0);
serial.writeString("");
serial.writeBuffer(null);
```

## Read

```cards
serial.readUntil("");
serial.readLine();
serial.readString();
serial.readBuffer();
```

## Configuration

```cards
serial.setRxBufferSize(64);
serial.setTxBufferSize(64);
```

## See Also

[write line](/reference/serial/write-line),
[write string](/reference/serial/write-string),
[write number](/reference/serial/write-number),
[write value](/reference/serial/write-value),
[write buffer](/reference/serial/write-buffer)
[read until](/reference/serial/read-until),
[read line](/reference/serial/read-line),
[read string](/reference/serial/read-string),
[read buffer](/reference/serial/read-buffer),
[set rx buffer size](/reference/serial/set-rx-buffer-size),
[set tx buffer size](/reference/serial/set-tx-buffer-size)

```package
serial
```