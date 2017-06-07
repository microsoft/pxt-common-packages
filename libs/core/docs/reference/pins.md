# Pins #pins

Use the pins for analog signals, digital signals, servos, and i2c.

## Analog

```cards
pins.A0.analogRead()
pins.A0.analogWrite(1023)
pins.A1.analogSetPeriod(20000)
pins.A1.servoWrite(180)
pins.A1.servoSetPulse(1500)
```

## Digital

```cards
pins.A0.digitalRead()
pins.A0.digitalWrite(false)
pins.D4.onPulsed(PulseValue.Low, () => {})
pins.A0.setPull(PinPullMode.PullDown)
pins.A0.pulseIn(PulseValue.High,0)
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
```
