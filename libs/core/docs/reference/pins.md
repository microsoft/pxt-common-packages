# Pins #pins

Use the pins for analog signals, digital signals, servos, and i2c.

## Analog

```cards
pins.A1.analogRead()
pins.A1.analogWrite(1023)
pins.A1.analogSetPeriod(20000)
pins.A1.servoWrite(180)
pins.A1.servoSetPulse(1500)
```

## Digital

```cards
pins.A1.digitalRead()
pins.A1.digitalWrite(false)
pins.D4.onEvent(PinEvent.PulseHigh, () => {})
pins.A1.setPull(PinPullMode.PullDown)
pins.A1.pulseIn(PulseValue.High,0)
pins.pulseDuration()
```

## I2C

```cards
pins.i2cReadNumber(0, NumberFormat.Int8LE, false)
pins.i2cWriteNumber(
0,
0,
NumberFormat.Int8LE,
false
)
pins.createI2C(undefined, undefined);
```

## SPI

```cards
pins.spiWrite(0);
pins.spiMode(3);
pins.createSPI(undefined, undefined, undefined);
```
