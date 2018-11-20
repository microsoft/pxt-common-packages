# move Sprite

Control the motion of a sprite with the direction buttons.

```sig
controller.moveSprite(null, 0, 0)
```

Instead of tracking the direction buttons in a game update function and then updating a sprite's position, you can set a sprite to move automatically when the buttons are pressed. You just decide how fast the sprite will move in both the horizontal and vertical directions when the related buttons are pressed.

## Parameters

* **sprite**: the [sprite](/types/sprite) to control with the buttons.
* **vx**: a [number](/types/number) which is the speed the sprite moves in the horizontal direction when the left or right button is pressed.
* **vy**: a [number](/types/number) which is the speed the sprite moves in the vertical direction when the up or down button is pressed.

## Example #example

Create a sprite with a circular image. Move the sprite around the screen with the direction buttons.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . 7 7 7 7 7 7 . . . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . 7 7 7 7 7 7 7 7 7 7 . . . 
. . . . . 7 7 7 7 7 7 . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Player)
controller.moveSprite(mySprite, 100, 100)
```

## See also #seealso

[dx](/reference/controller/dx),
[dy](/reference/controller/dy)