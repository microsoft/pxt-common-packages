# center Camera At

Center the camera view at a location in the scene.

```sig
scene.centerCameraAt(0, 0)
```

The size of your scene might be larger that the screen size. To move a part of the scene into the view of the screen, you can set the _camera_ view to center at a location in the scene.

## Parameters

* **x**: a [number](/types/number) that's the horizontal location of the scene to center the camera view at.
* **y**: a [number](/types/number) that's the vertical location of the scene to centere the camera view at.

## Example #example

Make a tile map that's 1.5 times the size of the screen. Draw a "X" pattern in the scene with tiles. Randomly center the camera view to each corner of the scene.

```blocks
let sceneMap: Image = null
let baseTile: Image = null
let sceneY = 0
let corner = 0
let sceneX = 0
sceneX = scene.screenWidth() * 3 / 2
sceneY = scene.screenHeight() * 3 / 2
sceneX = sceneX - sceneX % 8
sceneY = sceneY - sceneY % 8
baseTile = image.create(8, 8)
baseTile.fill(8)
sceneMap = image.create(sceneX / 8, sceneY / 8)
scene.setTile(8, baseTile)
sceneMap.fill(8)
sceneMap.drawRect(0, 0, sceneX / 8, sceneY / 8, 3)
sceneMap.drawLine(0, 0, sceneX / 8, sceneY / 8, 3)
sceneMap.drawLine(0, sceneY / 8, sceneX / 8, 0, 3)
scene.setTileMap(sceneMap)
game.onUpdateInterval(500, function () {
    corner = Math.randomRange(0, 3)
    if (corner == 0) {
        scene.centerCameraAt(0, 0)
    } else if (corner == 1) {
        scene.centerCameraAt(sceneX - 1, 0)
    } else if (corner == 2) {
        scene.centerCameraAt(0, sceneY - 1)
    } else {
        scene.centerCameraAt(sceneX - 1, sceneY - 1)
    }
})
```
## See also #seealso

[camera follow sprite](/reference/scene/camera-follow-sprite)