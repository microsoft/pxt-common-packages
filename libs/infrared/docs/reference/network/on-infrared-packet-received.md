# on Infrared Packet Received

Run some code when a data message comes into the infrared receiver.

```sig
network.onInfraredPacketReceived(function ({ receivedNumber }) {
	
})
```

The infrared receiver gets a data message sent from another board. The message is called a
_packet_. The packet has both the data from the sender and some other information used to help
transmit the data correctly between the boards. You only need to know what the program on the other
board wants to send you so your program just receives the _data_ part of the packet.

## Parameters

* **cb**: the [function](/types/function) that has the code to run when the infrared data message is received.
* **p**: the information sent in the infrared data message. This can have three parts:
>``receivedNumber``: a single [number](/types/number) value from the sender.<br/>
``receivedNumbers``: an array of [numbers](/types/number) from the sender.<br/>
``receivedBuffer``: a group of data values with no specific [type](/types). Both the sender and receiver agree about what kind information is in this buffer.

### ~hint
Right now, just use ``receivedNumber`` as your data part from the packet you receive over infrared.
### ~

## Using the packet data

The packet **p** is really a parameter of **cb**. In code, be sure to put the data part you want in
the **cb** [function](/types/function). It's done in code like this:

```typescript
network.onInfraredPacketReceived(function ({ receivedNumber }) {
    if (receivedNumber > 0) {
        light.pixels.setPixelColor(0, Colors.Red);
    }
})
```



## Example #ex1

Show the value of a number received from an infrared data message. The number is shown by lighting the same number of pixels on the pixel strip.

```blocks
network.onInfraredPacketReceived(function ({ receivedNumber }) {
    light.pixels.graph(receivedNumber, 9);
})
```

## See also

[``||network:infrared send number||``](/reference/network/infrared-send-number)