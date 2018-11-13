# dx

Gets the amount of horizontal movement to use if a left or right key is pressed.

```sig
controller.dx(0)
```

If you're controlling the location of a sprite by key pressess, you can decide how much change in position it will have when a key is pressed. This is done with _steps_. While a direction key is pressed, the movement value returned is based on if and how long the key is pressed, along with the step size you gave it. If you want fast movement, then you use a larger step size.

If the ``left`` key is pressed, then the movement value is negative. If the ``right`` key is pressed, the movement value is positive. You can use these values to update the location of a sprite. The step value is usually a positive number. If you want to reverse directions for the keys, you can use a negative step number.

## Parameters

* **step**: the amount of horizontal movement assigned to a key direction each time a key is detected as pressed.

## Returns

* a [number](/types/number) that is the amount movement left or right for a pressed key.

## Example #example

Move the ``cosmo`` object on the screen with the direction controller.

```blocks
const cosmo = sprites.create(img`
....aaaaa
...aaaaaaa
aaaaaaaaaaaaa
...aaaaaaa
....aaaaa
.....a.a
....a...a
`)
game.onUpdate(function () {
    cosmo.x += controller.dx(100)
    cosmo.y += controller.dy(80)
})
```

## See also #seealso

[dy](/reference/controller/dy),
[control sprite](/reference/controller/control-sprite)