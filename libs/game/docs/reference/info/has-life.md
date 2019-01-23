# has Life

```sig
info.player2.hasLife()
```

Returns a ``true`` value if the life count for the player is greater than zero.

## Returns

* a [boolean](/types/boolean) that is ``true`` if the player has lives remaining. Otherwise, ``false`` is returned.

## Example #Example

Remove one life from the player every `100` milleseconds. When the player's lives reach 0, end the game early.

```blocks
info.player2.setLife(20)
game.onUpdate(function () {
    if (info.player2.hasLife() == false) {
        game.over()
    }
}) 

game.onUpdateInterval(100, function () {
    info.player2.changeLifeBy(-1)
})
```

## See also

[change life by](/reference/info/change-life-by),
[on life zero](/reference/info/on-life-zero)