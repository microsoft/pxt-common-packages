# loop

Play a built-in melody continuously.

```sig
music.baDing.loop()
```

A melody will play and will continue to replay until it's stopped with the [stop](/reference/music/melody/stop) function.

There are several built-in melodies which you can play in your game. When using blocks, a melody is chosen from a dropdown list. In JavaScript, an instance of one of the built-in melodies is referenced in your code. You call the **loop** function from that instance of the melody, just like this:

```typescript
music.baDing.loop()
```

Your program continues immediately after the melody begins looping.

## ~ hint

To understand how melodies are created for use in arcade, take a look at the developer [sound](/developer/sound) page.

## ~

## Parameters

* **volume**: an optional sound volume for looping the melody. The volume range is from `0` to `255`. The default volume value is `128`.

## Examples #example

### I'll loop 'BaDing' #ex1

Loop the built-in sound called `BaDing`.

```blocks
music.baDing.loop()
```

### Loop 'Power Up' at full volume #ex2

Play the ``power up`` sound at a volume of `255`.

```blocks
music.powerUp.loop(255)
```

## See also #seealso

[play](/reference/music/melody/play),
[play until done](/reference/music/melody/play-until-done),
[stop](/reference/music/melody/stop)

```package
mixer
```