# set Mode

Sets the color encoding mode sent to the programmable lights.

```sig
light.createStrip().setMode(NeoPixelMode.RGB)
```

Most light strips use the Green Red Blue encoding (``NeoPixelMode.RGB``), some use Red Green Blue (``NeoPixelMode.RGB_RGB``).
Some LED strips also have a white LED (``NeoPixelMode.RGBW``).

## Parameters

* **mode**: the desired mode

```package
light
```


