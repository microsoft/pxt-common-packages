# position

Get the current position rotary encoder.

```sig
encoders.createRotaryEncoder(pins.A2, pins.A1).position( )
```

## Returns

* a [number](/types/number) that indicates the encoder's position.

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

[on changed](/reference/encoders/on-changed)

```package
encoders
```