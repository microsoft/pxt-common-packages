# say

Display a caption with some text near a sprite.

```sig
sprites.create(null).say("")
```

Sometimes you may want to have a message show up for a sprite. You can have a caption with a text string appear next to sprite and have it say something to the player.

## Parameters

* **text**: a [string](/types/string) that contains the text of the caption.
* **millis**: an optional [number](/types/number) of milliseconds to display the caption for.

## Examples #example

### Smiley message #ex1

Make a sprite for a smiley face image and display it on the screen with a message.

```blocks
let smiley: Sprite = null
smiley = sprites.create(img`
. . . . . f f f f f f f . . . . 
. . . f f e e e e e e e f . . . 
. . f e e e e e e e e e e f . . 
. f e e e e e e e e e e e e f . 
f e e e e f f e e e f f e e e f 
f e e e e f f e e e f f e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e f e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e f e e e e e f e e e f 
f e e e e e f f f f f e e e e f 
. f e e e e e e e e e e e e f . 
. . f e e e e e e e e e e f . . 
. . . f f e e e e e e e f . . . 
. . . . . f f f f f f f . . . . 
`)
smiley.say("Hello!")
```

### Yellow message

Make a square yellow sprite in the middle of the screen. Send a moving person sprite around the screen. When the person sprite crosses the yellow square, make the person say "Yellow!".

```blocks
sprites.onOverlap(SpriteKind.Player, SpriteKind.Player, function (sprite, otherSprite) {
    sprite.sayText("Yellow!", 100, false)
})
scene.setBackgroundColor(13)
let box = sprites.create(img`
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
    `, SpriteKind.Player)
let person = sprites.create(img`
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f f e 2 2 2 2 2 2 e e f . . 
    . . f e 2 f f f f f f 2 e f . . 
    . . f f f f e e e e f f f f . . 
    . f f e f b f 4 4 f b f e f f . 
    . f e e 4 1 f d d f 1 4 e e f . 
    . . f e e d d d d d d e e f . . 
    . . . f e e 4 4 4 4 e e f . . . 
    . . e 4 f 2 2 2 2 2 2 f 4 e . . 
    . . 4 d f 2 2 2 2 2 2 f d 4 . . 
    . . 4 4 f 4 4 5 5 4 4 f 4 4 . . 
    . . . . . f f f f f f . . . . . 
    . . . . . f f . . f f . . . . . 
    `, SpriteKind.Player)
person.setBounceOnWall(true)
person.setVelocity(50, 50)
```

## #seealso
