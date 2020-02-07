# send Value

Send a [string]() and [number]() together by ``radio`` to other @boardname@s.
The maximum [string]() length is 8 characters.

```sig
radio.sendValue("name", 0);
```

## Parameters

* **name**: a [string](/types/string) that is the name of the value to send.
* **value**: a [number](/types/number) that is the value to send.

## ~ hint

Watch this video to see how the radio hardware works on the @boardname@:

https://www.youtube.com/watch?v=Re3H2ISfQE8

## ~

## #example

## See also

[Bit Radio](/reference/radio)
[on received value](/reference/radio/on-received-value)

```package
radio
```