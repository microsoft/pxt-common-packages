# on Received Buffer

Run part of a program when the @boardname@ receives a buffer over ``radio``.

```sig
radio.onReceivedBuffer(function (receivedBuffer) {})
```

The data contained in **receivedBuffer** is put there as a data [type](/types). The data might be a [number](/types/number) or a [string](/types/string). When using buffers though, the way the data is placed in the buffer must have a specific format. In particular, numbers must have a certain order when their individual _bytes_ are placed into the buffer. The numbers must also be retrieved from the buffer using the order that they were placed in when set there. You can read more about [number formats](/types/buffer/number-format).

## Parameters

* **receivedBuffer**: The buffer that was sent in this packet or the empty string if this packet did not contain a string. See [send buffer](/reference/radio/send-buffer)

## #example

## See also

[Bit Radio](/reference/radio)
[send buffer](/reference/radio/send-buffer),
[number formats](/types/buffer/number-format)

```package
radio
```
