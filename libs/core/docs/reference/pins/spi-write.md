# spi Write

Write a single data value to an SPI slave device and return the response.

```sig
pins.spiWrite(0);
```

## Parameters

* ``value``: a [number](/types/number) value to send to the SPI slave.

## Returns

* a [number](/types/number) which is a response value from the SPI slave.

## Example

Write the value of `16` to the SPI slave device.

```blocks
let spiOK = pins.spiWrite(16);
```

## See also

[spi transfer](/reference/pins/spi-transfer)
