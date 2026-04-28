# runtime

Get the time since the game was started in milliseconds.

```sig
game.runtime()
```

## Returns

* a [number](/types/number) that is the amount of time the game has run for.

## Example #example

Give a sprite warning message when the game runtime is greater that `15` minutes.

```blocks
info.startCountdown(30)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 . . . . 4 4 4 . . . . 
    . 4 5 5 5 e . . e 5 5 5 4 . . . 
    4 5 5 5 5 5 e e 5 5 5 5 5 4 . . 
    4 5 5 4 4 5 5 5 5 4 4 5 5 4 . . 
    e 5 4 4 5 5 5 5 5 5 4 4 5 e . . 
    . e e 5 5 5 5 5 5 5 5 e e . . . 
    . . e 5 f 5 5 5 5 f 5 e . . . . 
    . . f 5 5 5 4 4 5 5 5 f . f f . 
    . . . 4 5 5 f f 5 5 6 f f 5 f . 
    . . . f 6 6 6 6 6 6 4 f 5 5 f . 
    . . . f 5 5 5 5 5 5 5 4 5 f . . 
    . . . . f 5 4 5 f 5 f f f . . . 
    . . . . . f f f f f f f . . . . 
    `, SpriteKind.Player)
game.onUpdateInterval(5000, function () {
    if (game.runtime() > (1000 * 60 * 15)) {
        mySprite.sayText("Time to quit!")
    }
})
```

## See also #seealso

[start countdown](/reference/info/start-countdown),
[change countdown by](/reference/info/change-countdown-by),
[on countdown end](/reference/info/on-countdown-end)