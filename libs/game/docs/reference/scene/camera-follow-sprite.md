# camera Follow Sprite

Make the game scene adjust to the motion of a sprite.

```sig
scene.cameraFollowSprite(null)
```

## Parameters

* a [sprite](/types/sprite) that the scene perspective will follow.

```sim
let sceneMap: Image = null
let tiler: Image = null
let bead: Sprite = null
let sign = 0
sign = -1
tiler = image.create(32, 32)
tiler.fill(4)
tiler.fillRect(0, 0, 16, 16, 8)
tiler.fillRect(16, 16, 16, 16, 8)
scene.setTile(0, tiler)
sceneMap = image.create(scene.screenHeight() * 3 / 64, scene.screenHeight() * 3 / 64)
sceneMap.fill(0)
scene.setTileMap(sceneMap)
bead = sprites.create(img`
. . . . 1 1 1 1 1 1 1 1 . . . . 
. . 1 1 . . . 1 1 . . . 1 1 . . 
. 1 . . . . . 1 1 . . . . . 1 . 
. 1 . . . . . 1 1 . . . . . 1 . 
1 . . . . . . 1 1 . . . . . . 1 
1 . . . . . . 1 1 . . . . . . 1 
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 . . . . . . 1 1 . . . . . . 1 
1 . . . . . . 1 1 . . . . . . 1 
. 1 . . . . . 1 1 . . . . . 1 . 
. 1 . . . . . 1 1 . . . . . 1 . 
. . 1 1 . . . 1 1 . . . 1 1 . . 
. . . . 1 1 1 1 1 1 1 1 . . . . 
`)
scene.cameraFollowSprite(bead)
bead.vx = 50
bead.vy = 50
game.onUpdateInterval(300, function () {
    if (bead.x < 0 || bead.x > scene.screenWidth()) {
        bead.vx = bead.vx * -1
    }
    if (bead.y < 0 || bead.y > scene.screenHeight() + 50) {
        bead.vy = bead.vy * -1
    }
})
```

## See also #seealso

[center camera at](/reference/scene/center-camera-at)