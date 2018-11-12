# on Destroyed

Run some code when a sprite of a certain kind is destroyed.

```sig
sprites.onDestroyed(0, function (sprite) {
	
})
```

## Parameters

* **kind**: the type of sprite to wait for a destroy event from.
* **handler**: the code to run when the sprite is destroyed.

## Example #example

Create a ``Ghost`` sprite and set it's ``lifespan`` to `1500`. You win the game when the ghost is destroyed.

```blocks
enum SpriteKind {
    Player,
    Enemy,
    Ghost
}
let ghost: Sprite = null
ghost = sprites.create(img`
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
`, SpriteKind.Ghost)
ghost.setFlag(SpriteFlag.Ghost, true)
ghost.lifespan = 1500
sprites.onDestroyed(SpriteKind.Ghost, function (sprite) {
    game.over(true)
})
```

## See also #seealso

[destroy](/reference/sprites/sprite/destroy)