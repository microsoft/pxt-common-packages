# countdown

Get the current game countdown time.

```sig
info.countdown()
```

## Returns

* a [number](/types/number) that is the amount of time remaining for the game countdown in seconds.

## Example #example

Give a sprite warning message when the game countdown time is less than `5` seconds.

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
game.onUpdateInterval(500, function () {
    if (info.countdown() < 5) {
        mySprite.sayText("Short on time!")
    }
})
```

## See also #seealso

[start countdown](/reference/info/start-countdown),
[change countdown by](/reference/info/change-countdown-by),
[on countdown end](/reference/info/on-countdown-end)