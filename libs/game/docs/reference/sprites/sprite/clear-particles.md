# clear Particles

Stop the particle effect currently displaying at a sprite.

```sig
effects.clearParticles(null)
```

Particle effects, when started, are set for a sprite. You can stop the effect early, if a duration was set, or stop it from running continuously if no duration was set.

## Parameters

* **anchor**: the sprite that the effect is displaying at.

## Example #example

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

## See also #seealso

[start effect](/reference/sprites/sprite/start-effect)
