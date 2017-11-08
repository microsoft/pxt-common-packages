# infrared Send Number

Send a number value to another @boardname@ using the infrared transmitter.

```sig
network.infraredSendNumber(0);
```

The infrared transmitter on your board will send a number as part of a data message signaled by infrared light pulses. If another @boardname@ is waiting to receive an infrared signal, it will get this number in the data message it receives.

## Parameters

* **value**: the [number](types/number) to send to another @boardname@ using infrared.

## Example #ex1

Send the numbers `0` to `9` to another @boardname@. Wait a little bit between each send to let the
receiving board think about the number it just got.

```blocks
for (let irDataNumber = 0; irDataNumber <= 9; irDataNumber++) {
    network.infraredSendNumber(irDataNumber);
    loops.pause(500);
}
```

## See also

[``||network:on infrared received number||``](/reference/network/on-infrared-received-number)

```package
infrared
```
