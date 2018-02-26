# on Infrared Received Number

Run some code when a number from a data message comes into the infrared receiver.

```sig
network.onInfraredReceivedNumber(function (num) {
	
})
```

The infrared receiver gets a data message sent from another board. The message is called a
_packet_. The packet has both the data from the sender and some other information used to help
transmit the data correctly between the boards. You only need to know what the program on the other
board wants to send you so your program just receives the _data_ part of the packet.

## Parameters

* **handler**: the [function](/types/function) that has the code to run when the infrared data message is received.
This function has one argument:
* ``num``: a single [number](/types/number) value received from the sender.

## Example #example

Show the value of a number received from an infrared data message. The number is shown by lighting the same number of pixels on the pixel strip.

```blocks
let strip = light.createStrip();

network.onInfraredReceivedNumber(function (num) {
    if (num > 0) { 
        strip.graph(num, 9);
    } 
})
```

## See also #seealso

[infrared send number](/reference/network/infrared-send-number)

```package
infrared
```