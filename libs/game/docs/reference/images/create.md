# create

Create a pixel image of a certain size.

```sig
image.create(0, 0)
```

An empty rectangular image is created for the number of pixels wide and high you ask for. Empty means that the image contains all transparent pixels. Pixels colors are set in the image using the [image](/reference/image) functions.

You can create an zero size image (``width = 0`` and ``height = 0``) but the function will actually create and image of a default size.

## Parameters

* **width**: the [number](/types/number) of pixels wide (x dimension) for the image.
* **height**: the [number](/types/number) of pixels high (y dimension) for the image.

## Returns

* an empty (transparent) [image](/types/image) of the desired size.

## Example #example

Create a 32 x 32 image and draw an orange border around it.

```blocks
let orangeBox = image.create(32, 32)
for (let i = 0; i < 32; i++) {
    orangeBox.setPixel(0, i, 13)
    orangeBox.setPixel(i, 0, 13)
    orangeBox.setPixel(i, 31, 13)
    orangeBox.setPixel(31, i, 13)
}
let boxSprite = sprites.create(orangeBox)
```

## See also #seealso

[image](/reference/image)