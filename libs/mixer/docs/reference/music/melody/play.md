# play

Play a built-in melody.

```sig
music.baDing.play()
```

There are several built-in melodies which you can play in your game. When using blocks, a melody is chosen from a dropdown list. In JavaScript, an instance of one of the built-in melodies is referenced in your code. You call the **play** function from that instance of the melody, just like this:

```typescript
music.baDing.play()
```

Your program continues immediately after the melody begins playing. If you want the code that follows the **play** function to wait, you can use [playUntilDone](/reference/mixer/melody/play-until-done) instead.

## ~ hint

To understand how melodies are created for use in arcade, take a look at the developer [sound](/developer/sound) page.

## ~

## Parameters

* **volume**: an optional sound volume for playing the melody. The volume range is from `0` to `255`. The default volume value is `128`.

## Examples #example

### I'll play 'BaDing' #ex1

Play a the built-in sound called `BaDing`.

```blocks
music.baDing.play()
```

### Play 'Power Up' at full volume #ex2

Play the ``power up`` sound at a volume of `255`.

```blocks
music.powerUp.play(255)
```

## See also #seealso

[play until done](/reference/music/melody/play-until-done),
[loop](/reference/music/melody/loop),
[stop](/reference/music/melody/stop)

```package
mixer
```