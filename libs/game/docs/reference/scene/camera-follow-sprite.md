# camera Follow Sprite

Make the game scene adjust to follow the motion of a sprite.

```sig
scene.cameraFollowSprite(null)
```

Your game scene might not be the same size as your screen. If the scene is bigger that the screen size, your sprites might travel past the edge of the screen. The sprite is still in the scene but it moves out of view. In order to keep your sprite in view on the screen, you can set the scene _camera_ to follow the sprite as it moves across the scene.

While a sprite is located on a part of the scene that currently is in the screen view, it will locate to a new position on the screen when moved. When the camera is following the sprite and it moves to a position outside the view of the screen, the sprite will center in the screen and scene moves instead. This creates the perspective of a camera view in motion across the scene.

## Parameters

* a [sprite](/types/sprite) that the scene camera will follow.

## Example #example

Make a tile map that creates a scene bigger than the screen. Move a sprite from one side of the screen to the other. Have the scene camera follow  the sprite as it moves toward the edge of the scene.

```blocks
let sceneMap: Image = null
let baseTile: Image = null
let ball: Sprite = null
let sceneX = 0
let sceneY = 0
sceneX = scene.screenWidth() * 3 / 2
sceneY = scene.screenHeight()
sceneX = sceneX - sceneX % 16
sceneY = sceneY - sceneY % 16
baseTile = image.create(16, 16)
baseTile.fill(4)
scene.setTile(4, baseTile)
sceneMap = image.create(sceneX / 16, sceneY / 16)
sceneMap.fill(4)
sceneMap.drawLine(0, 0, 0, sceneY / 16, 9)
sceneMap.drawLine(sceneX / 16, 0, sceneX /16, sceneY / 16, 9)
sceneMap.drawLine(sceneX / 32, 0, sceneX / 32, sceneY / 16, 7)

scene.setTileMap(sceneMap)
ball = sprites.create(img`
. . . . f f f f f f f f . . . . 
. . f e e e e e e e e e e f . . 
. f e e e e e e e e e e e e f . 
. f e e e e e e e e e e e e f . 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
. f e e e e e e e e e e e e f .
. f e e e e e e e e e e e e f .
. . f e e e e e e e e e e f . .
. . . . f f f f f f f f . . . . 
`)
ball.vx = 70
scene.cameraFollowSprite(ball)
game.onUpdate(function () {
    if (ball.x < 16 || ball.x > sceneX - 16) {
        ball.vx = ball.vx * -1
    }
})
```

## See also #seealso

[center camera at](/reference/scene/center-camera-at)