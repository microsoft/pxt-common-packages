# SPI Mode

Set the SPI signal mode.

```sig
pins.spiMode(3);
```

SPI uses two changes in the clock signal to decide when to transfer data. These two are the the clock _polarity (CPOL)_ and _phase (CPHA)_. Since there are two settings to check for, the mode can have one of 4 different values: CPOL rising or falling, and CPHA rising or falling. Both the sending and receiving devices need to use the same mode. The default mode is set as `3`.

## Parameters

* **mode**: the SPI transfer mode to set. This is one of the following values:
>* **0**: CPOL = `0`, CPHA = `0` - transfer at the lead rising edge of the clock 
>* **1**: CPOL = `0`, CPHA = `1` - transfer at the trailing falling edge of the clock
>* **2**: CPOL = `1`, CPHA = `0` - transfer at the lead falling edge of the clock 
>* **3**: CPOL = `1`, CPHA = `1` - transfer at the trailing rising edge of the clock 

## Example

Set the SPI signal mode to transfer at the trailing rising edge of the clock signal.

```blocks
pins.spiMode(3);
```

## See also

[spi frequency](/reference/pins/spi-frequency)
