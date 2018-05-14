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
let sceneY = 0
let sceneX = 0
sceneX = scene.screenWidth() * 3 / 2
sceneY = scene.screenHeight() * 3 / 2
sceneX = sceneX + sceneX % 32
sceneY = sceneY + sceneY % 32
tiler = image.create(32, 32)
tiler.fill(4)
tiler.fillRect(0, 0, 16, 16, 8)
tiler.fillRect(16, 16, 16, 16, 8)
scene.setTile(0, tiler)
sceneMap = image.create(sceneX / 32, sceneY / 32)
sceneMap.fill(0)
scene.setTileMap(sceneMap)
bead = sprites.create(img`
. . . . 1 1 1 1 1 1 1 1 . . . . 
. . 1 e e e e e e e e e e 1 . .
. 1 e e e e e e e e e e e e 1 .
. 1 e e f f e e e e e f f e 1 .
1 e e e f f e e e e e f f e e 1 
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 e e e e 1 1 e f f e e e e e 1
1 e e e e 1 1 e f f e e e e e 1 
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 f 1 1 1 1 f 1 1 1 1 
. 1 1 1 1 1 1 f f f f 1 1 1 1 . 
. 1 1 1 1 1 1 1 1 1 1 1 1 1 1 . 
. . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
. . . . 1 1 1 1 1 1 1 1 . . . . 
`)
scene.cameraFollowSprite(bead)
bead.vx = 50
bead.vy = 50
game.onUpdate(function () {
    if (bead.x < 8 || bead.x > sceneX - 8) {
        bead.vx = bead.vx * -1
    }
    if (bead.y < 8 || bead.y > sceneY - 8) {
        bead.vy = bead.vy * -1
    }
})
```

## See also #seealso

[center camera at](/reference/scene/center-camera-at)