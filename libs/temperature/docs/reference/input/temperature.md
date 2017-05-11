# Temperature

Find the temperature where you are. The temperature is measured in Celsius (metric) or Fahrenheit (imperial).
The @boardname@ can find the temperature nearby by checking how hot its computer chips are.

```sig
input.temperature(TemperatureUnit.Celsius)
```

### Returns

* a [Number](/types/number) that means the temperature in Celsius or Fahrenheit.

### How does it work?

The @boardname@ checks how hot its CPU (main computer chip) is.
Because the @boardname@ does not usually get very hot, the temperature of the CPU
is usually close to the temperature of wherever you are.
The @boardname@ might warm up a little if you make it work hard, though!

### Example: @boardname@ thermometer

The following example uses `temperature` and `show color` to vary the brightness of the pixels depending on the temperature in the room. 

```blocks
loops.forever(() => {
    light.pixels.setBrightness(Math.map(
        input.temperature(TemperatureUnit.Celsius),
        0,
        50,
        0,
        255
    ))
    light.pixels.showColor(light.colors(Colors.Red))
})
```

### Example: Fahrenheit thermometer

This program measures the temperature using Fahrenheit degrees.

```blocks
loops.forever(() => {
    light.pixels.setBrightness(Math.map(
        input.temperature(TemperatureUnit.Fahrenheit),
        30,
        100,
        0,
        255
    ))
    light.pixels.showColor(light.colors(Colors.Red))
})
```

### ~hint

Try comparing the temperature your @boardname@ shows to a real thermometer in the same place.
You might be able to figure out how much to subtract from the number the @boardname@
shows to get the real temperature. Then you can change your program so the @boardname@ is a 
better thermometer.

### ~

### See also

[compass-heading](/reference/input/compass-heading), [acceleration](/reference/input/acceleration)

