# get Pixel

Get the color number of a pixel at a location in an image.

```sig
image.create(0, 0).getPixel(0, 0)
```

# Parameters

* **x**: a [number](/types/number) that's the horziontal position of the pixel.
* **y**: a [number](/types/number) that's the vertical position of the pixel.

## Returns

* a [number](/types/number) that's the color of the pixel at location **x** and **y** in the image. The color number is a value between `0` and `15`.

## Example #example

Randomly fill an image with different colors. Change the color of a pixel in the middle if it's yellow.

```blocks
let showColors: Sprite = null
let randoColors: Image = null
randoColors = image.create(16, 16)
for (let y = 0; y <= 15 - 1; y++) {
    for (let x = 0; x <= 15 - 1; x++) {
        randoColors.setPixel(x, y, Math.randomRange(0, 15))
    }
}
if (randoColors.getPixel(8, 8) == 14) {
    randoColors.setPixel(8, 8, 1)
}
```

## See also #seeaslo

[set pixel](/reference/images/image/set-pixel)