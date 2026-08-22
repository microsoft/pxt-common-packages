# set Game Over Image

Set a image to display when the game is over.

``` sig
  game.setGameOverImage(true, img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . 5 4 4 4 4 4 4 5 . . . . 
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    . . . . 4 5 5 5 5 5 5 1 . . . . 
    . . . 5 4 4 5 5 5 5 1 1 5 . . . 
    . . 5 . 4 4 5 5 5 5 1 1 . 5 . . 
    . . 5 . 4 4 5 5 5 5 1 1 . 5 . . 
    . . . 5 4 4 5 5 5 5 1 1 5 . . . 
    . . . . 4 4 5 5 5 5 1 1 . . . . 
    . . . . . 4 5 5 5 1 1 . . . . . 
    . . . . . . 4 5 1 1 . . . . . . 
    . . . . . . . 4 1 . . . . . . . 
    . . . . . 4 4 5 5 1 1 . . . . . 
    . . . . . . . . . . . . . . . . 
    `)
```

## Parameters

* **win**: a [boolean](/types/boolean) value set to `true` to display a win image if the player wins the game. Set to `false` to display a game over image if the player loses
* **image**: an image [Image](/types/Image) to show when the game is over.

## Example

Make a game over win image appear when the puppy sprite overlaps the puppy's owner.

```blocks
 namespace SpriteKind {
    export const Owner = SpriteKind.create();
 }

 game.setGameOverImage(true, img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . 5 4 4 4 4 4 4 5 . . . . 
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    . . . . 4 5 5 5 5 5 5 1 . . . . 
    . . . 5 4 4 5 5 5 5 1 1 5 . . . 
    . . 5 . 4 4 5 5 5 5 1 1 . 5 . . 
    . . 5 . 4 4 5 5 5 5 1 1 . 5 . . 
    . . . 5 4 4 5 5 5 5 1 1 5 . . . 
    . . . . 4 4 5 5 5 5 1 1 . . . . 
    . . . . . 4 5 5 5 1 1 . . . . . 
    . . . . . . 4 5 1 1 . . . . . . 
    . . . . . . . 4 1 . . . . . . . 
    . . . . . 4 4 5 5 1 1 . . . . . 
    . . . . . . . . . . . . . . . . `)
 let puppySprite = sprites.create(img`
    . . 4 4 4 . . . . 4 4 4 . . . .
    . 4 5 5 5 e . . e 5 5 5 4 . . .
    4 5 5 5 5 5 e e 5 5 5 5 5 4 . .
    4 5 5 4 4 5 5 5 5 4 4 5 5 4 . .
    e 5 4 4 5 5 5 5 5 5 4 4 5 e . .
    . e e 5 5 5 5 5 5 5 5 e e . . .
    . . e 5 f 5 5 5 5 f 5 e . . . .
    . . f 5 5 5 4 4 5 5 5 f . . f f
    . . f 4 5 5 f f 5 5 6 f . f 5 f
    . . . f 6 6 6 6 6 6 4 4 f 5 5 f
    . . . f 4 5 5 5 5 5 5 4 4 5 f .
    . . . f 5 5 5 5 5 4 5 5 f f . .
    . . . f 5 f f f 5 f f 5 f . . .
    . . . f f . . f f . . f f . . .
`, SpriteKind.Player)
  controller.moveSprite(mySprite)
  let owner = sprites.create(img`
    . . . f f f f f . . . .
    . . f e e e e e f f . .
    . f e e e e e e e f f .
    f e e e e e e e f f f f
    f e e 4 e e e f f f f f
    f e e 4 4 e e e f f f f
    f f e 4 4 4 4 4 f f f f
    f f e 4 4 f f 4 e 4 f f
    . f f d d d d 4 d 4 f .
    . . f b b d d 4 f f f .
    . . f e 4 4 4 e e f . .
    . . f 1 1 1 e d d 4 . .
    . . f 1 1 1 e d d e . .
    . . f 6 6 6 f e e f . .
    . . . f f f f f f . . .
    . . . . . f f f . . . .
`, SpriteKind.Owner)
  sprites.onOverlap(SpriteKind.Player, SpriteKind.Owner, function (sprite: Sprite, otherSprite: Sprite) {
    game.gameOver(true)  
  })
```
