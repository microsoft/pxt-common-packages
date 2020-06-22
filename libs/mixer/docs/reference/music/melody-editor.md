# melody Editor

Show the melody editor and return the composed melody string.

```sig
music.melodyEditor("");
```

In Blocks, the melody editor is displayed and the user can create a melody using the melody editor interface. The composed melody is returned as a melody string for use with **playMelody**.

When not using Blocks, the **melody** string parameter is returned.

## Parameters

* **melody**: a [string](/types/string) which contains the notes of the current melody.

## Returns

* a [string](/types/number) that contains the new melody created in the melody editor or the string in **melody** when the melody editor is not displayed.

## Example #example

Change the melody in **playMelody** using the melody editor.

```blocks
forever(function () {
    music.playMelody(music.melodyEditor("E F G F E G B C5 "), 120)
})
```

## See also #seealso

[play melody](/reference/music/play-melody)
