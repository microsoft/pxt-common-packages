# set Flag

Set a sprite flag to **ON** or **OFF**.

```sig
sprites.create(null).setFlag(0, false)
```

Sprite flags are settings that change the way a sprite reacts on the screen. When sprites are created they have default behaviors that are set by these flags. The flags determine if a sprite is forced to always stay on the screen or if it gets destroyed when moves off of the screen. Another behavior, _ghosting_, causes the sprite to not overlap other sprites or collide with obstacles. There are flags to set the behavior of a sprite when it hits walls or overlaps other sprites.

## Parameters

* **flag**: the sprite flag to turn on or off. The flags are:
>* [stay in screen](#stay-in-screen): the sprite is forced to stay on the screen when it reaches a screen edge.
>* [ghost](#ghost): the sprite never overlaps other sprites, it goes through wall tiles, and tile overlaps and wall hits aren't detected.
>* [auto destroy](#auto-destroy): the sprite is automatically destroyed when it moves off the screen.
>* [destroy on wall](#destroy-on-wall): the sprite is automatically destroyed when it collides with a wall tile.
>* [bounce on wall](#bounce-on-wall): the sprite will deflect when it collides with a wall tile
>* [show physics](#show-physics): the sprite will display its position, velocity, and acceleration below it.
>* [invisible](#invisible): the sprite will not be drawn to the screen.
>* [relative to camera](#relative-to-camera): the sprite is drawn relative to the camera rather than relative to the world and the sprite never overlaps other sprites or collides with obstacles. This is useful for drawing static elements to the screen (scores, dialog boxes, etc.) that shouldn't move when the camera pans.
>* [ghost through sprites](#ghost-through-sprites): the sprite will pass over or under other sprites and not create an overlap event.
>* [ghost through tiles](#ghost-through-tiles): the sprite will not trigger events when passing over tiles.
>* [ghost through walls](#ghost-through-walls): the sprite will pass through wall tiles not trigger a will hit event.

## Flags

### Stay in screen

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.StayInScreen, true)
```

Setting ``stay in screen`` to **ON** forces the sprite to remain in the view of the screen. The sprite stays in the current view of the screen even if a new position set for it is outside of the screen. The sprite in the following example always appears on the screen even though is initial position is off the screen and its motion will send it past the screen edge.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setFlag(SpriteFlag.StayInScreen, true)
pause(500)
mySprite.left = -20
mySprite.top = -50
pause(500)
mySprite.vx = 30
```

### ~hint

#### Scene or screen?

A sprite will always stay inside the limits of your scene if your game has a tilemap. Setting the ``stay in screen`` flag to **OFF** will not let your sprite keep moving past the edge of the game scene. If the scene is larger than the screen and you have ``auto destroy`` set to **ON**, the sprite will destroy itself when it moves past the edge of the screen even though it's still inside the scene.

### ~

### Ghost

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.Ghost, true)
```

A ``ghost`` sprite will pass through wall tiles and causes no overlap events with tiles or other sprites.

The example here shows a ghost sprite moving past another sprite without an overlap event occuring. It also passes over a non-wall tile and through a wall tile without stopping or triggering tile events.

```blocks
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    sprite.say("Ouch!")
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Player, function (sprite, otherSprite) {
    otherSprite.say("Boo!")
})
scene.onOverlapTile(SpriteKind.Player, sprites.dungeon.floorDark2, function (sprite, location) {
    sprite.say("Pass!")
})
let ghost = sprites.create(img`
    . . . . . . d d d d d . . . . . 
    . . . d d d d 1 1 1 d d d . . . 
    . . d d 1 1 1 1 1 1 1 1 d d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d d . 
    . d d 1 1 1 f 1 1 1 f 1 1 1 d . 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 d d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d d 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 d 1 1 1 1 1 1 d 
    d 1 d d d 1 1 d d d d 1 d 1 1 d 
    d d d . d d d d . . d d d d d d 
    d d . . . d d . . . . d . . d d 
    `, SpriteKind.Player)
let person = sprites.create(img`
    . . . . . . . . . . . . . . 
    . . . . . f f f f . . . . . 
    . . . f f 5 5 5 5 f f . . . 
    . . f 5 5 5 5 5 5 5 5 f . . 
    . f 5 5 5 5 5 5 5 5 5 5 f . 
    c b 5 5 5 d b b d 5 5 5 b c 
    f 5 5 5 b 4 4 4 4 b 5 5 5 f 
    f 5 5 c c 4 4 4 4 c c 5 5 f 
    f b b f b f 4 4 f b f b b f 
    f b b e 1 f d d f 1 e b b f 
    c f b f d d d d d 4 4 b f c 
    . c e c 6 9 9 9 4 d d d c . 
    . e 4 c 9 9 9 9 4 d d 4 c . 
    . e c b b 3 b b b e e c . . 
    . . c c 3 3 b 3 b 3 c c . . 
    . . . . c b b c c c . . . . 
    `, SpriteKind.Player)
tiles.setTilemap(tilemap`level_2`)
ghost.setFlag(SpriteFlag.Ghost, true)
ghost.left = 0
person.left = 30
ghost.vx = 40
```

### Auto destroy

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.AutoDestroy, true)
```
Sprites with the ``auto destroy`` flag on are destroyed when the sprite's image moves past the edge of the screen.

This example continuously creates sprites and destroys them when they move off of the screen. The score value is used to count the sprites that are destroyed.

```blocks
sprites.onDestroyed(SpriteKind.Player, function (sprite) {
    info.changeScoreBy(1)
})
let mySprite: Sprite = null
info.setScore(0)
game.onUpdateInterval(500, function () {
    mySprite = sprites.create(img`
        . . . . . 2 2 2 2 2 2 . . . . . 
        . . . 2 2 2 2 2 2 2 2 2 2 . . . 
        . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
        . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
        . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
        . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
        . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
        . . . 2 2 2 2 2 2 2 2 2 2 . . . 
        . . . . . 2 2 2 2 2 2 . . . . . 
        `, SpriteKind.Player)
    mySprite.setFlag(SpriteFlag.AutoDestroy, true)
    mySprite.left = 0
    mySprite.vx = 200
})
```

### Destroy on wall

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.DestroyOnWall, true)
```

The sprite is destroyed when it meets a wall tile or reaches the edge of the scene's tilemap.

```blocks
sprites.onDestroyed(SpriteKind.Player, function (sprite) {
    sprite.startEffect(effects.disintegrate)
})
let mySprite: Sprite = null
mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
tiles.setTilemap(tilemap`level_0`)
mySprite.setFlag(SpriteFlag.DestroyOnWall, true)
mySprite.left = 0
mySprite.vx = 30
```

### Bounce on wall

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.BounceOnWall, true)
```

The ``bounce on wall`` flag causes the sprite to bounce away from a wall tile when it contacts it. The sprite will also bounce back from the edge of the scene's tilemap.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setFlag(SpriteFlag.BounceOnWall, true)
tiles.setTilemap(tilemap`level_0`)
mySprite.vx = 50
mySprite.vy = 50
```

If the scene has no tilemap set, the sprite will bounce off the edges of the screen.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setFlag(SpriteFlag.BounceOnWall, true)
mySprite.vx = 50
mySprite.vy = 50
```

### Show physics

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.ShowPhysics, true)
```

A sprite with ``show physics`` set **ON** will show its position and motion settings in a caption next to it.

```blocks
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.setFlag(SpriteFlag.ShowPhysics, true)
mySprite.x = 10
mySprite.y = 10
mySprite.ax = 7
mySprite.ay = 5
```

### Invisible

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.Invisible, true)
```

Setting the `invisible` sprite flag causes the sprite to not be displayed on the screen.

```blocks
let visible = false
let mySprite = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
mySprite.left = 0
mySprite.vx = 10
game.onUpdateInterval(1000, function () {
    if (visible) {
        mySprite.setFlag(SpriteFlag.Invisible, false)
    } else {
        mySprite.setFlag(SpriteFlag.Invisible, true)
    }
    visible = !(visible)
})
```

### Relative to camera

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.RelativeToCamera, true)
```

The ``relative to camera`` flag fixes the position of the sprite on the screen as the view of the scene changes. This keep the sprite from moving off the screen as the camera view moves. Also, there sprite creates no collisions and doesn't overlap other sprites.

The following example sets a sprite in the upper right corner of the screen. The sprite remains at the same location on the screen as the camera view of the scene moves from left to right.

```blocks
tiles.setTilemap(tilemap`level_3`)
let mover = sprites.create(img`
    . . . . . 2 2 2 2 2 2 . . . . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
    . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
    . . . 2 2 2 2 2 2 2 2 2 2 . . . 
    . . . . . 2 2 2 2 2 2 . . . . . 
    `, SpriteKind.Player)
let fixer = sprites.create(img`
    . . . . . 7 7 7 7 7 7 . . . . . 
    . . . 7 7 7 7 7 7 7 7 7 7 . . . 
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
    . . . 7 7 7 7 7 7 7 7 7 7 . . . 
    . . . . . 7 7 7 7 7 7 . . . . . 
    `, SpriteKind.Player)
fixer.setFlag(SpriteFlag.RelativeToCamera, true)
fixer.top = 0
fixer.right = scene.screenWidth()
mover.left = 0
mover.vx = 50
scene.cameraFollowSprite(mover)
```

### Ghost through sprites

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.GhostThroughSprites, true)
```

Setting ``ghost through sprites`` will allow a sprite to pass over or under another sprite without causing an overlap event.

The following example shows a ghost sprite passing under another sprite without triggering an overlap event.

```blocks
sprites.onOverlap(SpriteKind.Player, SpriteKind.Player, function (sprite, otherSprite) {
    otherSprite.say("Boo!")
})
let ghost = sprites.create(img`
    . . . . . . d d d d d . . . . . 
    . . . d d d d 1 1 1 d d d . . . 
    . . d d 1 1 1 1 1 1 1 1 d d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d d . 
    . d d 1 1 1 f 1 1 1 f 1 1 1 d . 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 d d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d d 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 d 1 1 1 1 1 1 d 
    d 1 d d d 1 1 d d d d 1 d 1 1 d 
    d d d . d d d d . . d d d d d d 
    d d . . . d d . . . . d . . d d 
    `, SpriteKind.Player)
    let person = sprites.create(img`
    . . . . . . . . . . . . . . 
    . . . . . f f f f . . . . . 
    . . . f f 5 5 5 5 f f . . . 
    . . f 5 5 5 5 5 5 5 5 f . . 
    . f 5 5 5 5 5 5 5 5 5 5 f . 
    c b 5 5 5 d b b d 5 5 5 b c 
    f 5 5 5 b 4 4 4 4 b 5 5 5 f 
    f 5 5 c c 4 4 4 4 c c 5 5 f 
    f b b f b f 4 4 f b f b b f 
    f b b e 1 f d d f 1 e b b f 
    c f b f d d d d d 4 4 b f c 
    . c e c 6 9 9 9 4 d d d c . 
    . e 4 c 9 9 9 9 4 d d 4 c . 
    . e c b b 3 b b b e e c . . 
    . . c c 3 3 b 3 b 3 c c . . 
    . . . . c b b c c c . . . . 
    `, SpriteKind.Player)
ghost.setFlag(SpriteFlag.GhostThroughSprites, true)
ghost.left = 0
ghost.vx = 40
```

### Ghost through tiles

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.GhostThroughTiles, true)
```

Setting ``ghost through tiles`` to **ON** lets a sprite pass over a tile without causing an overlap event.

The example here shows a ghost sprite crossing over a tile without being detected in an overlap event.

```blocks
scene.onOverlapTile(SpriteKind.Player, sprites.dungeon.floorDark0, function (sprite, location) {
    sprite.say("Pass!")
})
let ghost = sprites.create(img`
    . . . . . . d d d d d . . . . . 
    . . . d d d d 1 1 1 d d d . . . 
    . . d d 1 1 1 1 1 1 1 1 d d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d d . 
    . d d 1 1 1 f 1 1 1 f 1 1 1 d . 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 d d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d d 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 d 1 1 1 1 1 1 d 
    d 1 d d d 1 1 d d d d 1 d 1 1 d 
    d d d . d d d d . . d d d d d d 
    d d . . . d d . . . . d . . d d 
    `, SpriteKind.Player)
tiles.setTilemap(tilemap`level_0`)
ghost.setFlag(SpriteFlag.GhostThroughTiles, true)
ghost.left = 0
ghost.vx = 40
```

### Ghost through walls

```block
let mySprite: Sprite = null
mySprite.setFlag(SpriteFlag.GhostThroughWalls, true)
```

Setting the ``ghost through walls`` flag lets a sprite pass through wall tiles. Also, a wall hit won't occur when it reaches a wall tile.

The example here shows a ghost sprite passing through a wall tile without being detected.

```blocks
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    sprite.say("Ouch!")
})
let ghost = sprites.create(img`
    . . . . . . d d d d d . . . . . 
    . . . d d d d 1 1 1 d d d . . . 
    . . d d 1 1 1 1 1 1 1 1 d d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d . . 
    . . d 1 1 1 1 1 1 1 1 1 1 d d . 
    . d d 1 1 1 f 1 1 1 f 1 1 1 d . 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 d d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    . d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d d 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 f f 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
    d 1 1 1 1 1 1 1 d 1 1 1 1 1 1 d 
    d 1 d d d 1 1 d d d d 1 d 1 1 d 
    d d d . d d d d . . d d d d d d 
    d d . . . d d . . . . d . . d d 
    `, SpriteKind.Player)
tiles.setTilemap(tilemap`level_1`)
ghost.setFlag(SpriteFlag.GhostThroughWalls, true)
ghost.left = 0
ghost.vx = 40
```

```jres
{
    "transparency16": {
        "data": "hwQQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "mimeType": "image/x-mkcd-f4",
        "tilemapTile": true
    },
    "level_0": {
        "id": "level_0",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "sprites.dungeon.floorDark0"
        ]
    },
    "level_1": {
        "id": "level_1",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "sprites.dungeon.floorDark0"
        ]
    },
    "level_2": {
        "id": "level_2",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAwYTAwMDgwMDAwMDAwMDAwMDAwMjAwMDAwMTAwMDAwMDAwMDAwMDAyMDAwMDAxMDAwMDAwMDAwMDAwMDIwMDAwMDEwMDAwMDAwMDAwMDAwMjAwMDAwMTAwMDAwMDAwMDAwMDAyMDAwMDAxMDAwMDAwMDAwMDAwMDIwMDAwMDEwMDAwMDAwMDAwMDAwMjAwMDAwMTAwMDAwMDAwMDAwMDAyMDAwMDAxMDAwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMjAwMDAwMDAwMDIwMDAwMDAwMDAyMDAwMDAwMDAwMg==",
        "tileset": [
            "myTiles.transparency16",
            "sprites.dungeon.floorLight2",
            "sprites.dungeon.floorDark2"
        ]
    },
    "level_3": {
        "id": "level_3",
        "mimeType": "application/mkcd-tilemap",
        "data": "MTAyNDAwMDgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDEwMTAyMDIwMjAzMDMwMzA0MDQwNDAzMDMwMzA0MDQwNDA1MDUwNTA1MDYwNjA2MDYwNzA3MDcwNzA1MDUwNTA1MDgwODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        "tileset": [
            "myTiles.transparency16",
            "sprites.builtin.forestTiles2",
            "sprites.builtin.forestTiles28",
            "sprites.builtin.forestTiles22",
            "sprites.builtin.forestTiles25",
            "sprites.castle.tileGrass3",
            "sprites.castle.tilePath5",
            "sprites.builtin.forestTiles12",
            "sprites.castle.tileDarkGrass2"
        ]
    },
    "*": {
        "mimeType": "image/x-mkcd-f4",
        "dataEncoding": "base64",
        "namespace": "myTiles"
    }
}
```

## See also #seealso

[set stay in screen](/reference/sprites/sprite/set-stay-in-screen),
[set bounce on wall](/reference/sprites/sprite/set-bounce-on-wall),
[on overlap](/reference/sprites/on-overlap),
[on hit wall](/reference/tiles/on-hit-wall),
[camera follow sprite](/reference/scene/camera-follow-sprite)
