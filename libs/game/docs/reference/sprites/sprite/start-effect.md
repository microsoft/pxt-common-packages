# start Effect

Start a built-in effect at a sprite.

```sig
sprites.create(null).startEffect(effects.spray, 500)
```

There are several built-in particle motion effects you can put on a sprite. In the Blocks editor, the effect is chosen from the list shown on the block. In JavaScript, choose one of the effects that are contained in the ``effects`` namespace. The effect will run continuously unless you give a value for the ``duration``. You can stop the effect by using the [clearParticles](/reference/sprites/sprite/clear-particles) function.

## Parameters

* **effect**: the effect to start at the sprite.
* **duration**: a [number](/types/number) that is an optional amount of time, in milliseconds, for the effect to run. If you don't give a value for the duration, the effect will continues to run.

## Example #example

Start a 5 second ``cool radial`` spray effect on the blob sprite.

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
blobject.startEffect(effects.coolRadial, 5000)
```

## See also #seealso

[clear particles](/reference/sprites/sprite/clear-particles)
