# on Event

Run some code when data is received or when the receive buffer is full.

```sig
serial.onEvent(SerialEvent.DataReceived, function () {})
```

If you want your program to read any new data as soon as is received, you can use the ``data received`` event. This lets new data without having to try first with one of the read functions. Also, you can have an event to read data when the receive buffer fills up. This lets your program wait until certain amount of data is received until it reads it in.

## Parameters

* **event**: the data receive event to watch for. You can run code right away when data is received or set the event wait for the receive buffer to fill first. The receive events are: ``data received`` and ``rx buffer full``.
* **handler**: the code to run when the receive event happens.

## Example #example

### Data received event #ex1

Build a string of characters as they are received by the serial connection.

```blocks
let myChars = ""
serial.onEvent(SerialEvent.DataReceived, function () {
    myChars += serial.readString()
})
```

### Receive buffer full event

Set the receive buffer size to `80`. Read all of the data in the receive buffer when it fills up.

```blocks
let myChars = ""
serial.setRxBufferSize(80)
serial.onEvent(SerialEvent.RxBufferFull, function () {
    myChars = serial.readString()
})
```

## See also #seealso

[on delimiter received](/reference/serial/on-delimiter-received)

```package
serial
```