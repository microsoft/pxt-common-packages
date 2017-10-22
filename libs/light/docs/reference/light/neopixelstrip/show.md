# show

Tell the pixel strip to show all the buffered pixel changes that are ready.

```sig
light.createStrip().show()
```

You use **show** if you have pixel changes that are **[buffered](/reference/light/neopixelstrip/set-buffered)**. Any changes to the pixels caused by other light operations will appear when you use **show**. 

## Example

Set the color of two pixels but buffer each light change. Make all the changes appear at the same time.

```blocks
let strip = light.createStrip()
strip.setBuffered(true)
strip.setPixelColor(0, Colors.Blue)
strip.setPixelColor(2, Colors.Red)
strip.show()
```

## See also

[set buffered](/reference/light/neopixelstrip/set-buffered)

```package
light
```


