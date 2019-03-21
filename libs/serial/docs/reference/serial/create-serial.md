# create Serial

Create a new serial communication channel on the pins.

```sig
serial.createSerial(pins.TX, pins.RX)
```

If your board doesn't have a USB connection which provides a serial port, you can create a serial communication channel on its pins. Also, you might want another serial channel for exclusive use by your program for which you set your own bus identifier.

You choose a digital pin for transmitting and another digital pin to receive on.

This will create an instance of the ``Serial`` port object. This new instance is not set as the device instance for the board so you need to use the [serial](/reference/serial) functions as methods of the object returned.

## Parameters

* **tx**: the digital pin to transmit on for the new serial channel.
* **rx**: the digital pin to receive from for the new serial channel.
* **id**: the event bus identifier (optional).

## Return

* a ``Serial`` instance that allows to interact with the bus directly.

## Example #example

Create your own serial communication device on pins **A0** and **A1**.

```typescript-ignore
let mySerial = serial.createSerial(pins.A0, pins.A1)
mySerial.serialDevice.setBaudRate(BaudRate.BaudRate9600)
mySerial.writeLine("My own serial connection")
```

## See also #seealso

[redirect](/reference/serial/redirect)

```package
serial
```