# set Pixel White LED

Set the white brightness of a pixel in a NeoPixel strip of RGB+W LEDs.

```sig
light.pixels.setPixelWhiteLED(0,0);
```
If the pixel strip has RGB+W type LEDs, you can set the brightness of the white LED
at a pixel position in the strip. Strips with RGB+W LEDs combine both RGB and white LEDs for
extra brightness and glow effects.

## Parameters

* **pixeloffset**: the [number](/types/number) of the pixel position in the strip for the white LED, like: 14
* **white**: a [number](/types/number) which for the brightness of the white LED. The brightness is
between 0 (totally dark) and 255 (very bright).

## Example

Set the white pixel at position `5` in an RGB+W NeoPixel strip to half brightness.

```blocks
let rgbwStrip = light.createNeoPixelStrip(null, 24, NeoPixelMode.RGBW)
rgbwStrip.setPixelWhiteLED(5, 128)
```

## See Also

[``||create new pixel strip||``](/reference/light/create-neo-pixel-strip)

```package
light
```


