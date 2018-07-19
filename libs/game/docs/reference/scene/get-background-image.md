# get Background Image

Gets the background image for the screen.

```sig
scene.backgroundImage()
```

You can get the current image for the background of the screen. The background image is always behind other images shown on the screen.

## Example #example

Create and empty image that's the size of the screen. Fill the image with four colored squares. Set the image as the screen background and rotate the colors every `2` seconds.

```blocks
let screenY = 0
let backImage: Image = null
let screenX = 0
screenX = scene.screenWidth()
screenY = scene.screenHeight()
backImage = image.create(screenX, screenY)
backImage.fillRect(0, 0, screenX / 2, screenY / 2, 7)
backImage.fillRect(screenX / 2, 0, screenX / 2, screenY / 2, 10)
backImage.fillRect(0, screenY / 2, screenX / 2, screenY / 2, 14)
backImage.fillRect(screenX / 2, screenY / 2, screenX / 2, screenY / 2, 4)
scene.setBackgroundImage(backImage)

game.onUpdateInterval(2000, function () {
    let curImage = scene.backgroundImage();
    curImage.replace(4, 0)
    curImage.replace(10, 4)
    curImage.replace(7, 10)
    curImage.replace(14, 7)
    curImage.replace(0, 14)
})
```

## See also #seealso

[set background image](/reference/scene/set-background-image)