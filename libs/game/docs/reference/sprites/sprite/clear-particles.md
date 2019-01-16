# clear Particles

Stop the particle effect currently displaying at a sprite.

```sig
effects.clearParticles(null)
```

Particle effects, when started, are set for a sprite. You can stop the effect early, if a duration was set, or stop it from running continuously if no duration was set.

## Parameters

* **anchor**: the sprite that the effect is displaying at.

## Example #example

### Spray the confetti #ex1

Start a ``confetti`` effect on the blob sprite for 5 seconds but then stop it after just 2 seconds.

```blocks
let blobject: Sprite = null
blobject = sprites.create(img`
    . a a a a .
    . a a a a .
    a a a a a a
    a a a a a a
    . a a a a .
    . a a a a .
`, 0)
blobject.startEffect(effects.confetti, 5000)
pause(2000)
effects.clearParticles(blobject)
```

### Campfire #ex2

Show a ``fire`` effect coming from a sprite image of firewood. When button **A** is pressed, the campfire goes out and the ``bubble`` effect simulates the fire smoldering.

```blocks
let logs: Sprite = null
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    effects.clearParticles(logs)
    logs.startEffect(effects.bubbles, 1500)
})
logs = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . e . . .
    . . e e . . . . . . . e e . . .
    . . . e e e . . . e e d e . . .
    . . . e d e e e . e d e e . . .
    . . . e e d d e e d d e . . . .
    . . . . . e e d d e e . . . . .
    . . . e e d e e d d e . . . . .
    . . e e d d e e e d d e e . . .
    . . e d d e e . e e e d e e . .
    . . e e e . . . . . e e e . . .
    . . . . . . . . . . . . . . . .
`, 0)
logs.startEffect(effects.fire)
```

## See also #seealso

[start effect](/reference/sprites/sprite/start-effect)
