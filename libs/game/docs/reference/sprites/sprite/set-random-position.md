# set Random Position

Place a sprite at a random position on the screen.

```sig
sprites.create(null).setRandomPosition()
```

## Random placement

This method places the sprite at a random position on the visible screen. The sprite will always be fully visible - it won't be placed partially off-screen. The position is calculated to ensure that the entire sprite image fits within the screen boundaries.

This is useful for games where you want to spawn sprites at unpredictable locations, such as collectibles, enemies, or obstacles.

## Example #example

Create five food sprites and place them at random positions on the screen.

```blocks
for (let i = 0; i < 5; i++) {
    let food = sprites.create(img`
. . . . . . b b b b . . . . . . 
. . . . . . b 4 4 4 b . . . . . 
. . . . . . b b 4 4 4 b . . . . 
. . . . . b 4 b b b 4 4 b . . . 
. . . . b d 5 5 5 4 b 4 4 b . . 
. . . . b 3 2 3 5 5 4 e 4 4 b . 
. . . b d 2 2 2 5 7 5 4 e 4 4 e 
. . . b 5 3 2 3 5 5 5 5 e e e e 
. . b d 7 5 5 5 3 2 3 5 5 e e e 
. . b 5 5 5 5 5 2 2 2 5 5 d e e 
. b 3 2 3 5 7 5 3 2 3 5 d d e 4 
. b 2 2 2 5 5 5 5 5 5 d d e 4 . 
b d 3 2 d 5 5 5 d d d 4 4 . . . 
b 5 5 5 5 d d 4 4 4 4 . . . . . 
4 d d d 4 4 4 . . . . . . . . . 
4 4 4 4 . . . . . . . . . . . . 
`, SpriteKind.Food)
    food.setRandomPosition()
}
```

## See also #seealso

[set position](/reference/sprites/sprite/set-position),
[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y)
