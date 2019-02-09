# create Serial

Opens a UART Serial communication channel over the given pins.

```sig
pins.createSerial(undefined, undefined, undefined);
```

## Parameters

* ``TX`` pin
* ``RX`` pin
* ``id``,event bus id (optional)

## Return

A ``Serial`` instance that allows to interact with the bus directly.