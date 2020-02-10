# Send Buffer

Sends a buffer to other @boardname@s in the area connected by radio. The
maximum buffer length is 19 bytes.

```sig
radio.sendBuffer(pins.createBuffer(1))
```

## Parameters

* `msg` is a [buffer](/types/buffer) to send by radio.


## #example

## See also

[Bit Radio](/reference/radio)
[on received buffer](/reference/radio/on-received-buffer)

```package
radio
```