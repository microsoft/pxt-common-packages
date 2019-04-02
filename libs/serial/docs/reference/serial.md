# Serial

Reading and writing data over a serial connection.

## Read

```cards
serial.readUntil(Delimiters.NewLine);
serial.readLine();
serial.readString();
serial.readBuffer();
```

## Write

```cards
serial.writeLine("");
serial.writeNumber(0);
serial.writeValue("x", 0);
serial.writeString("");
serial.writeBuffer(null);
```

## Events

```cards
serial.onDelimiterReceived(Delimiters.NewLine, function () {})
serial.onEvent(SerialEvent.DataReceived, function () {})
```

## Configuration

```cards
serial.setRxBufferSize(64);
serial.setTxBufferSize(64);
serial.redirect
serial.setBaudRate(BaudRate.BaudRate115200)
serial.redirect(null, null, BaudRate.BaudRate115200)
serial.attachToConsole()
```

## Advanced

```cards
serial.createSerial(undefined, undefined);
```

## See Also

[read until](/reference/serial/read-until),
[read line](/reference/serial/read-line),
[read string](/reference/serial/read-string),
[read buffer](/reference/serial/read-buffer),
[write line](/reference/serial/write-line),
[write string](/reference/serial/write-string),
[write number](/reference/serial/write-number),
[write value](/reference/serial/write-value),
[write buffer](/reference/serial/write-buffer),
[on event](/reference/serial/on-event),
[on delimiter received](/reference/serial/on-delimiter-received),
[set rx buffer size](/reference/serial/set-rx-buffer-size),
[set tx buffer size](/reference/serial/set-tx-buffer-size),
[set baud rate](/reference/serial/set-baud-rate),
[redirect](/reference/serial/redirect),
[attach to console](/reference/serial/attach-to-console),
[create serial](/reference/serial/create-serial)

```package
serial
```