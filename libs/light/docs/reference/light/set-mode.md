# set Mode

Sets the color encoding mode for the default light strip.

```sig
light.defaultStrip().setMode(NeoPixelMode.RGB)
```

Most light strips use the Green Red Blue encoding (``NeoPixelMode.RGB``), some use Red Green Blue (``NeoPixelMode.RGB_RGB``).
Some LED strips also have a white LED (``NeoPixelMode.RGBW``).

## Parameters

* **mode**: the desired mode

## Example

Set the mode of the default LED strip to `RGBW`.

```blocks
light.setMode(NeoPixelMode.RGBW)
```

```package
light
```


