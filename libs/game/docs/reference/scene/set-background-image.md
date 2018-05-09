# set Background Image

Sets an image as the background for the screen.

```sig
scene.setBackgroundImage(null)
```

You can set an image for the background of the screen. The background image is always behind other images shown on the screen.

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
    backImage.replace(4, 0)
    backImage.replace(10, 4)
    backImage.replace(7, 10)
    backImage.replace(14, 7)
    backImage.replace(0, 14)
})
```

## See also #seealso

[set background color](/reference/scene/set-background-color)