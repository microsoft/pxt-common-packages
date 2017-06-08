# create Neo Pixel Strip

Create a NeoPixel connection between your program and a pixel strip.

```sig
light.createNeoPixelStrip();
```
When you connect a pixel strip to your @boardname@, you have to give your program a way
to work with it. You tell your program that there is a pixel strip you want to use with
``||create neo pixel strip||``.

To use ``||create neo pixel strip||``, you need to know which pin the strip is attached to and
how many pixels (LEDs) are on the strip. Also, some pixel strips have different types LEDs.
If you know the exact type, you can set it in the pixel mode. 

## Parameters

* **pin**: [DigitalPin](/reference/pins), the pin where the neopixel strip is connected.
* **numleds**: the [number](/types/number) of LEDs in the strip, such as: 10, 30, 60, or 64.
* **mode**: the mode to light and flash LEDs. The basic mode is RGB but you can set a different
mode if your pixels have a different type of LEDs.

## Example

Connect a pixel strip to the pin `D4`. Make all pixels light up `green`.

```typescript
let neostrip = light.createNeoPixelStrip(pins.D4, 10);
neostrip.setAll(Colors.Green)
```

## See Also

[``||range||``](/reference/light/range)

```package
light
```


