# on Life Zero

Run some code when the player life count reaches zero.

```sig
info.onLifeZero(function () {})
```

If you've set a life count for your came, you can take an action when the life count reaches `0`. Depending on the rules for your game, you may wish to end the game or remove a player sprite.

If you set a game life count (using [setLife](/reference/info/set-life)) and it decreases to `0` but you have no **onLifeZero** function in your program, the game will automatically end.

## ~ hint

Indiviual sprites have their own [lifespan](/reference/sprites/sprite/lifespan). They are destroyed if their lifespan was set and then reaches `0`. This is different from the [life](/reference/info/life) count for the game. Game lives are awarded and removed based on your own rules for gameplay.

## ~

## Parameters

* **handler**: the code to run when the life count reaches `0`.

## Example #example

### Life zero message #ex1

Set the life count to `3`. In the game update function, decrease the life count by `1` each second. Show a message when the life count becomes `0`.

#### Single player

```blocks
info.setLife(3)
game.onUpdateInterval(1000, function() {
    info.changeLifeBy(-1)
})
info.onLifeZero(function () {
    game.showLongText("Life is zero!", DialogLayout.Bottom)
})
```

#### Multiplayer

```blocks
info.player2.setLife(3)
game.onUpdateInterval(1000, function() {
    info.player2.changeLifeBy(-1)
})
info.player2.onLifeZero(function () {
    game.showLongText("Life is zero!", DialogLayout.Bottom)
})
```

### No lives, game over #ex2

Set the game life count to `9` lives. Run out the lives to end the game.

```blocks
info.setLife(9)
game.onUpdateInterval(300, function() {
    info.changeLifeBy(-1)
})
```

## See also #seealso

[life](/reference/info/life),
[set life](/reference/info/set-life),
[change life by](/reference/info/change-life-by)