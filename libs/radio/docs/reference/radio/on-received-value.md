# on Received Value

Run part of a program when the @boardname@ receives a name-value-pair over ``radio``.

```sig
radio.onReceivedValue(function (name, value) {})
```

## Parameters

* **name**: a [string](/types/string) that is a name for the value received.
* **value**: a [number](/types/number) that is the value received.

## ~ hint

Watch this video to see how the radio hardware works on the @boardname@:

https://www.youtube.com/watch?v=Re3H2ISfQE8

## ~

## #example

## Troubleshooting

The ``||radio:on received value||`` event can only be created once, due to the hardware restrictions.

The radio set group might need to be set, synchronized , before the radio events will function.

## See also

[Bit Radio](/reference/radio)
[on received number](/reference/radio/on-received-number),
[received packet](/reference/radio/received-packet),
[send number](/reference/radio/send-number),
[send string](/reference/radio/send-string),
[send value](/reference/radio/send-value),
[set group](/reference/radio/set-group)

```package
radio
```
