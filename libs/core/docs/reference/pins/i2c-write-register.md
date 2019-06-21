# i2c Write Register

Write a number value to a device register at an address on the I2C bus.

```sig
pins.i2cWriteRegister(0, 0, 0)
```

Devices connected to an I2C bus will often have registers where data values are set as status or action requests. Although the device is accessed at a single address, it can have multiple registers. Each register has an index so a register write operation can put the data value in the correct place. Registers are like mailslots at a post office that hold a single number value.

## Parameters

* **address**: a [number](types/number) between `8` and `123` that is the address of a chip on the I2C bus.
* **register**: a [number](types/number) that is the index of the device register to write to.
* **value**: a [number](types/number) to write to the I2C bus. It's size (number of bytes) depends
on what you say in **valueFormat**.
* **valueFormat**: An optional format specifier for the number you will write to the register, like: `UInt16LE`. The default is ``UInt8LE``. 

## Example

Write an output value to the conversion register of a digital to analog converter (DAC). The DAC is connected to the I2C bus at address `23` and the conversion register is at index `1`.

```blocks
let DAC = 23
let register = 1 
let dacData = 178
pins.i2cWriteRegister(DAC, register, dacData)
```

## See also

[i2c read register](/reference/pins/i2c-read-register)
[i2c write number](/reference/pins/i2c-write-number)
