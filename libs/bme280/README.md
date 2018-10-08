# BME280

makecode BME280 Digital Pressure and Humidity Sensor package for Maker MakeCode  

Author: shaoziyang  
Date:   2018.Mar  

Modified for SAMD21: Andrés Sabas  
Date:   Octuber 2018 

## I2C Address  

- 0x76/0x77  

## API

- function pressure()  
get pressure in pa  

- function temperature()  
return temperature in Celsius.

- function humidity()
return humidity in percent

- function PowerOn()
turn on BME280.

- function PowerOff()  
goto sleep mode  

- function Address(addr: BME280_I2C_ADDRESS)  
set BME280's I2C address. addr may be:  
  - BME280_I2C_ADDRESS.ADDR_0x76
  - BME280_I2C_ADDRESS.ADDR_0x77

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  

## Maintainer

[Electronic Cats](https://github.com/ElectronicCats)

## Supported targets

* for PXT/maker

```package
bme280
```