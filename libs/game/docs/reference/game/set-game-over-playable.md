# set Game Over Playable

Set a sound to play when the game is over.

```sig
game.setGameOverPlayable(true, music.melodyPlayable(music.powerUp), false)
```

## Parameters

* **win**: a [boolean](/types/boolean) value set to `true` to start the **sound** if the player wins the game. Set to `false` to start the **sound** if the player loses.
* **sound**: the sound to play when the game is over, such as `ba ding`, `siren`, or `buzzer`.
* **looping**: loop the **sound** when set to `true`. Play the **sound** only once if `false`.

## Example #example

Make the game over when the kitten sprite touches the left of the screen. Play the `siren` sound when the player wins the game.

```blocks
game.setGameOverPlayable(true, music.melodyPlayable(music.siren), false)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . 
    e e e . . . . e e e . . . . 
    c d d c . . c d d c . . . . 
    c b d d f f d d b c . . . . 
    c 3 b d d b d b 3 c . . . . 
    f b 3 d d d d 3 b f . . . . 
    e d d d d d d d d e . . . . 
    e d f d d d d f d e . b f b 
    f d d f d d f d d f . f d f 
    f b d d b b d d 2 b f f d f 
    . f 2 2 2 2 2 2 d b b d b f 
    . f d d d d d d d f f f f . 
    . . f d b d f d f . . . . . 
    . . . f f f f f f . . . . . 
    `, SpriteKind.Player)
mySprite.vx = -20
game.onUpdateInterval(500, function () {
    if (mySprite.left < 0) {
        game.gameOver(true)
    }
})
```

## See also #seealso

[set game over effect](/reference/game/set-game-over-effect),
[set game over message](/reference/game/set-game-over-message)