# on Received Number

Run part of a program when the @boardname@ receives a
[number](/types/number) over ``radio``.

```sig
radio.onReceivedNumber(function (receivedNumber) {})
```

## Parameters

* **receivedNumber**: The [number](/types/number) that was sent in this packet or `0` if this packet did not contain a number. See [send number](/reference/radio/send-number) and [send value](/reference/radio/send-value)

## ~ hint

Watch this video to see how the radio hardware works on the @boardname@:

https://www.youtube.com/watch?v=Re3H2ISfQE8

## ~

## #example

## Troubleshooting

The ``||radio:onReceivedNumber||`` event can only be created once, due to the hardware restrictions.

The radio set group might need to be set, synchronized, before the radio events will function.

## See also

[Bit Radio](/reference/radio)
[on received string](/reference/radio/on-received-string),
[received packet](/reference/radio/received-packet),
[send number](/reference/radio/send-number),
[send string](/reference/radio/send-string),
[send value](/reference/radio/send-value),
[set group](/reference/radio/set-group)

```package
radio
```
