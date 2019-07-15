# i2c Read Register

Read a number value from a device register at an address on the I2C bus.

```sig
pins.i2cReadRegister(0, 0)
```

Devices connected to an I2C bus will often have registers where data values are set as status or action requests. Although the device is accessed at a single address, it can have multiple registers. Each register has an index so a register read operation can get the data value from the correct place. Registers are like mailslots at a post office that hold a single number value.

## Parameters

* **address**: a [number](types/number) between `8` and `123` that is the address of a chip on the I2C bus.
* **register**: a [number](types/number) that is the index of the device register to write to.
* **valueFormat**: An optional format specifier for the number you will write to the register, like: `UInt16LE`. The default is ``UInt8LE``. 

## Returns

* a [number](types/number) to that is read from the **register** at the **address** on the I2C bus. It's size (number of bytes) depends on what you say in **valueFormat**.

## Example

Read a value from a temperature sensor connected to the I2C bus, The sensor is connected at address `41` and the temperature value register is at index `3`.

```blocks
let sensor = 41
let register = 3
let temperature = 0
temperature = pins.i2cReadRegister(sensor, register)
```

## See also

[i2c write register](/reference/pins/i2c-write-register),
[i2c read number](/reference/pins/i2c-read-number)
