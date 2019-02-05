# create SPI

Opens a SPI serial communication channel over the given pins.

```sig
pins.createSPI(undefined, undefined);
```

## Parameters

* ``MOSI`` pin
* ``MISO`` pin
* ``SCK`` pin

## Return

A ``SPI`` instance that allows to interact with the bus directly.