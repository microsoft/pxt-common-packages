# create APA102 Strip

Create a controller for an addressable APA102 LED strip.

```sig
light.createAPA102Strip();
```

When you connect a APA102 pixel strip to your @boardname@, you have to give your program a way
to work with it. You tell your program that there is a pixel strip you want to use with
``||create apa102 strip||``.

To use ``||create apa102 strip||``, you need to know which pins the strip is attached to for data and clock signals, and
how many pixels (LEDs) are on the strip. Also, some pixel strips have different types LEDs.
If you know the exact type, you can set it in the pixel mode. 

## Parameters

* **dataPin**: [DigitalInOutPin](/reference/pins), the pin where the neopixel strip is connected for data.
* **clkPin**: [DigitalInOutPin](/reference/pins), the pin where the neopixel strip is connected for the clock signal.
* **numleds**: the [number](/types/number) of LEDs in the strip, such as: 10, 30, 60, or 64.

## Returns

* a new **NeoPixelStrip** controller for the neopixels on a APA102 strip connected to the board.

## Example

Connect a APA102 pixel strip to pind `A1` and `A2`. Make all pixels light up `green`.

```typescript
const strip = light.createStrip(pins.A1, pins.A2, 40);
strip.setAll(0x00ff00)
```

## See Also

[range](/reference/light/neopixelstrip/range), [set mode](/reference/light/neopixelstrip/set-mode)

```package
light
```
