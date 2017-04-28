# create Neo Pixel Strip

Create a new NeoPixel driver for `numleds` LEDs.

```sig
light.createNeoPixelStrip();
```

## Parameters

* **pin**: [DigitalPin](/reference/blocks/DigitalPin), the pin where the neopixel is connected.,
* **numleds**: [number](/reference/blocks/number), number of leds in the strip, eg: 24,30,60,64,
* **mode**: [NeoPixelMode](/reference/blocks/NeoPixelMode), 

## Example

```blocks
let strip = light.createNeoPixelStrip(pins.A8, 150);
control.forever(() => {
    light.builtin.showAnimationFrame(light.cometAnimation())
})
```

## See Also

```package
light
```


