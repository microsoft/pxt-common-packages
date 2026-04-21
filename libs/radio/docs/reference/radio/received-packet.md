# received Packet

Get a property for the last radio packet received

```sig
radio.receivedPacket(RadioPacketProperty.Time)
```

Some information about the last packet received is available such as the time it was received, the packet serial number, or the signal strength when received.

## Parameters

* **type**: the type of property to return for the received packet:

> `time`: the time when the packed was received
> `serial number`: the serial number of the packet
> `signal strength`: the signal strength at the time the packet was received

## Simulator

This function only works on the @boardname@, not in browsers.

## Example

Get the signal strength of the last received packet.

```blocks
let ss = radio.receivedPacket(RadioPacketProperty.SignalStrength)
```

## See also

[on received number](/reference/radio/on-received-number),
[on received string](/reference/radio/on-received-string),
[on received value](/reference/radio/on-received-value)

```package
radio
```