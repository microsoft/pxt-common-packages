# spi Frequency

Set the SPI clock frequency.

```sig
pins.spiFrequency(1000000);
```

## Parameters

* **frequency**: a [number](/types/number) to set as the frequency for the SPI bus clock. This value is the number of clock changes per second (Hz).

## Example

Set the SPI clock frequency to `1` megahertz.

```blocks
pins.spiFrequency(1000000);
```

## See also

[spi mode](/reference/pins/spi-mode)
