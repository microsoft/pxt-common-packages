# melody Playable

Create a playable melody from a built-in melody.

```sig
music.melodyPlayable(music.baDing)
```

Melodies are a sequence of notes that played one after the other. There are several built-in melodies you can play in your games. An easy way to add music to your game is to choose one of the built-in melodies.

## Parameters

* **melody**: a built-in melody to create a playable object for, such as `ba ding`, `magic wand`, or `siren`.

## Returns

* a [playable](/types/playable) object that contains the built-in **melody**.

## Example #example

Play the `magic wand` melody until it is done.

```blocks
music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.UntilDone)
```

## See also #seealso

[tone playable](/reference/music/tone-playable),
[string playable](/reference/music/string-playable)