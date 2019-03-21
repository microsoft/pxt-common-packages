# stop

Stop a built-in melody from playing.

```sig
music.baDing.stop()
```

If the built-in melody is currently playing, it will stop. If you decide to play the melody again  it will start from the beginning. It won't resume from the point where you stopped it.

There are several built-in melodies which you can play in your game. When using blocks, a melody is chosen from a dropdown list. In JavaScript, an instance of one of the built-in melodies is referenced in your code. You call the **stop** function from that instance of the melody, just like this:

```typescript
music.baDing.stop()
```

## ~ hint

To understand how melodies are created for use in arcade, take a look at the developer [sound](/developer/sound) page.

## ~

## Example #example

Loop the the ``power up`` melody. Wait for 5 seconds and then stop it.

```blocks
music.powerUp.loop()
pause(5000)
music.powerUp.stop()
```

## See also #seealso

[play](/reference/music/melody/play),
[play until done](/reference/music/melody/play-until-done),
[loop](/reference/music/melody/loop)

```package
mixer
```