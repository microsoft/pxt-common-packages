# set Pixel

Set the color of a pixel location in an image.

```sig
image.create(0,0).setPixel(0,0,0)
```

Pixels are an individual point of color in an [image](/types/image). Pixels are arraged in columns (its ``x`` value) and rows (its ``y`` value). All of the pixels together make the rectangle of the image. Some pixels might have no color (transparent) and other pixels might have a color value set for them.

## Parameters

* **x**: the column [number](/types/number) of the pixel location.
* **y**: the row [number](/types/number) of the pixel location.
* **c**: the [number](/types/number) of the new color to set for the pixel location of **x** and **y**. Color numbers are value between `0` and `15` which select a color from the current palette of colors.

## Example #example

Make a "hatch" pattern in an image by setting the color of every other pixel in each row.

```blocks
let hatch: Image = null
let patch: Sprite = null
hatch = image.create(32, 32)
for (let y = 0; y <= 31; y++) {
    for (let x = 0; x <= 15; x++) {
    	if (y % 2 > 0)
        {
            hatch.setPixel(x * 2 + 1, y, 10)
        } else {
            hatch.setPixel(x * 2, y, 10)        
        }
    }
}
patch = sprites.create(hatch)
```

## See also #seealso

[image](/types/image),
[get pixel](/reference/images/image/get-pixel)