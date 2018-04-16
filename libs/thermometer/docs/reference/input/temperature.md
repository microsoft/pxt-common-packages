# Temperature

Find the temperature where you are. The temperature is measured in Celsius (metric) or Fahrenheit (imperial).
The @boardname@ can find the temperature nearby by checking how hot its computer chips are.

```sig
input.temperature(TemperatureUnit.Celsius);
```
## Parameters

* **unit**: the unit of temperature, either Celsius or Fahrenheit.

## Returns

* a [number](/types/number) that means the temperature in degrees of Celsius or Fahrenheit.

### How does it work?

The @boardname@ checks how hot its CPU (main computer chip) is.
Because the @boardname@ does not usually get very hot, the temperature of the CPU
is usually close to the temperature of wherever you are.
The @boardname@ might warm up a little if you make it work hard, though!

## Examples #example

### @boardname@ thermometer #ex1

Use **temperature** and **set all** to vary the brightness of the pixels depending on the temperature in the room.

```blocks
let pixels = light.createStrip();

forever(() => {
    pixels.setBrightness(Math.map(
        input.temperature(TemperatureUnit.Celsius),
        0,
        50,
        0,
        255
    ));
    pixels.setAll(0xff0000);
});
```


### Fahrenheit thermometer #ex2

Measure the temperature using degrees in Fahrenheit.

```blocks
let pixels = light.createStrip()

forever(() => {
    pixels.setBrightness(Math.map(
        input.temperature(TemperatureUnit.Fahrenheit),
        30,
        100,
        0,
        255
    ));
    pixels.setAll(0xff0000);
})
```

### ~hint
**Try this**

Try comparing the temperature your @boardname@ shows to a real thermometer in the same place.
You might be able to figure out how much to subtract from the number the @boardname@
shows to get the real temperature. Then you can change your program so the @boardname@ is a
better thermometer.

### ~

## See also #seealso

[on temperature condition changed](/reference/input/on-temperature-condition-changed)

