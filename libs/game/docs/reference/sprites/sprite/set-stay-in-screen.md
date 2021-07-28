# set Stay In Screen

Set a sprite to always stay in the screen view.

```sig
sprites.create(null).setStayInScreen(false)
```

You can make your sprite always remain in the screen view. This sets a sprite [flag](/reference/sprites/sprite/set-flag#stay-in-screen) to keep the sprite on screen even when it's position or movement would case it to move outside of these screen view.

## Parameters

* **on**: a [boolean](/types/boolean) value to set the ``stay in screen`` flag for the sprite. A ``true`` value means set to **ON** and a ``false`` value means **OFF**.

## Example

Set a sprite to appear on the screen even though is initial position is off the screen and its motion will send it past the screen edge.

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

## See also

[set flag](/reference/sprites/sprite/set-flag), [set bounce on wall](/reference/sprites/sprite/set-bounce-on-wall)