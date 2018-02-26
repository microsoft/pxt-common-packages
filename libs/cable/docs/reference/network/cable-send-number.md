# Cable Send Number

Send a number value to another @boardname@ using a cable.

```sig
network.cableSendNumber(0);
```

The cable transmitter on your board will send a number as part of a data message signaled by pulses. If another @boardname@ is waiting to receive an cable message, it will get this number in the data message it receives.

## Parameters

* **value**: the [number](types/number) to send to another @boardname@ using a cable.

## Example #example

Send the numbers `0` to `9` to another @boardname@. Wait a little bit between each send to let the
receiving board think about the number it just got.

```blocks
for (let i = 0; i <= 9; i++) {
    network.cableSendNumber(i);
    pause(500);
}
```

## See also #seealso

[on cable received number](/reference/network/on-cable-received-number)

```package
cable
```
