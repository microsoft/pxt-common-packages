# sounds

Get a sound string for a built-in sound.

```sig
music.sounds(Sounds.BaDing)
```
There are some built-in sounds you can play so you don't have to compose everything. You
can use these sounds to make actions with the @boardname@ seem more interesting.

## Parameters

* ``name``: the name of the built-in sound you want.

## Returns

* a [string](/types/string) that is the composed sound of a built-in sound.

## Example #example

Set a variable for the ``wand sound``. Play the sound set in the variable.

```blocks
let wandSound = music.sounds(Sounds.MagicWand); 
music.playSoundUntilDone(wandSound)
```

## See also #seealso

[play sound](/reference/music/play-sound)

[Composing sounds](/reference/music/composing-sounds)

```package
music
```