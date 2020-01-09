# Radio

Send and receive data using radio packets.

```cards
radio.sendNumber(0);
radio.sendValue("name", 0);
radio.sendString("");
radio.sendBuffer(pins.createBuffer(1));
radio.onReceivedNumber(function (receivedNumber) { });
radio.onReceivedValue(function (name, value) { });
radio.onReceivedString(function (receivedString) { });
radio.onReceivedBuffer(function (receivedBuffer) { });
radio.setGroup(0);
```

## Advanced

```cards
radio.setTransmitPower(7);
radio.setFrequencyBand(50);
radio.setTransmitSerialNumber(false);
radio.raiseEvent(0, 0);
```

```package
radio
```

## See Also

[send number](/reference/radio/send-number),
[send value](/reference/radio/send-value),
[send string](/reference/radio/send-string),
[send buffer](/reference/radio/send-buffer),
[on received number](/reference/radio/on-received-number),
[on received value](/reference/radio/on-received-value),
[on received string](/reference/radio/on-received-string),
[on received buffer](/reference/radio/on-received-buffer),
[set group](/reference/radio/set-group),
[set transmit power](/reference/radio/set-transmit-power),
[set transmit serial number](/reference/radio/set-transmit-serial-number),
[raise event](/reference/radio/raise-event)
