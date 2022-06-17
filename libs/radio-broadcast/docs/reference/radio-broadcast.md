# Radio Broadcast

The Radio Broadcast extension has blocks for sending to and receiving messages from all the @boardname@ boards nearby. Just two blocks are used, one to send a broadcast message and another to run code when a broadcast message is received.

A message, which is a [number](/types/number), is sent to, or received by all nearby @boardname@ boards regardless of which [Group](/reference/radio/set-group) number they are transmitting or receiving on.

## Blocks in this extension

```cards
radio.sendMessage(0)
radio.onReceivedMessage(0, function() {})
```

## See Also

[send message](/reference/radio/send-message),
[send value](/reference/radio/on-received-message)

```package
radio-broadcast
```