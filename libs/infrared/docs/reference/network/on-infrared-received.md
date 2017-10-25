# on Infrared Packet Received

Run some code when a data message comes into the infrared receiver.

```sig
network.onInfraredReceived(function (num) {
	
})
```

The infrared receiver gets a data message sent from another board. The message is called a
_packet_. The packet has both the data from the sender and some other information used to help
transmit the data correctly between the boards. You only need to know what the program on the other
board wants to send you so your program just receives the _data_ part of the packet.

## Parameters

* **handler**: the [function](/types/function) that has the code to run when the infrared data message is received.
This function takes 3 optional arguments:
* ``num``: a single [number](/types/number) value from the sender.
* ``nums``: an array of [numbers](/types/number) from the sender.
* ``buffer``: a group of data values with no specific [type](/types). Both the sender and receiver agree about what kind information is in this buffer.

### ~hint
Right now, just use ``num`` as your data part from the packet you receive over infrared.
### ~

## Example #ex1

Show the value of a number received from an infrared data message. The number is shown by lighting the same number of pixels on the pixel strip.

```blocks
network.onInfraredReceived(function (num) {
    light.pixels.graph(num, 9);
})
```

## See also

[``||network:infrared send number||``](/reference/network/infrared-send-number)

```package
infrared
```