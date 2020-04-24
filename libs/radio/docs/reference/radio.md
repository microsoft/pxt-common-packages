# Bit Radio

Send and receive data using the Bit Radio protocol.

### ~ hint

#### Bit Radio

The Bit Radio protocol was originally developped by [Lancaster University](https://github.com/lancaster-university/microbit-dal/commit/d9d2343ab63a707ac9d0167545261ab57b996430#diff-4f1efa652dafc9c738aae3a4bc5c3dad) for the BBC micro:bit project.

This protocol does not contain any form of encryption, authentication or authorization. It's purpose is solely for use as a teaching aid to demonstrate how simple communications operates, and to provide a sandpit through which learning can take place.

### ~


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
