# on Changed

Run some code when the rotary encoder changes position.

```sig
encoders.createRotaryEncoder(pins.A2, pins.A1).onChanged(function () {})
```

## Example #example

Show the encoder position on the game console when it changes.

```typescript
const crank = encoders.createRotaryEncoder(pins.A2, pins.A1);
game.consoleOverlay.setVisible(true);
let sprite = sprites.create(sprites.castle.heroFrontAttack1)
crank.onChanged(function () {
    console.log(crank.position())
    sprite.x = screen.width / 2 + crank.position()
})
```

## See also #seealso

[position](/reference/encoders/position)

```package
encoders
```