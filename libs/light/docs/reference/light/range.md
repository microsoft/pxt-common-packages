# range

Create a new, smaller pixel strip from part of the current pixel strip.

```sig
light.pixels.range(0, 4)
```
The new pixel strip is a smaller, _virtual_, strip with some or all of the pixels
from the current, or original, strip. You can use **range** to make new mini strips from
one larger strip for use in more complex light effects.

If you have a pixel strip with 10 pixels, you can make 2 new _virtual_ strips by giving
the new strips 5 pixels each. An example of this is something like:

```block
let strip1 = light.pixels.range(0, 5)
let strip2 = light.pixels.range(5, 5)
```
You can use these new pixels strips by themselves with their own light actions:

```blocks
let strip1 = light.pixels.range(0, 5)
let strip2 = light.pixels.range(5, 5)
strip1.setAll(Colors.Yellow)
strip2.setPixelColor(0, Colors.Red)
```
The original strip has a `red` pixel at pixel spot `5` but it's at pixel spot `0` for
the new virtual strip called `strip2`.

## Parameters

* **start**: the pixel position where the new pixel strip starts at, such as 5
* **length**: the amount of pixels the new pixel strip will have, like: 10

## Returns

* A new pixel strip created from the current pixel strip, with some or all of pixels.

## Example

Make a smaller strip from the current pixel strip. Shift an `orange` pixel from the beginning
of the new pixel strip to its end.

```blocks
let smallStrip = light.pixels.range(0, 4)
smallStrip.setPixelColor(0, Colors.Red)
for (let i = 0; i < smallStrip.length() - 1; i++) {
    loops.pause(500)
    smallStrip.move(LightMove.Shift, 1)
}
```
## See also

[``||create strip||``](/reference/light/create-strip)

```package
light
```


