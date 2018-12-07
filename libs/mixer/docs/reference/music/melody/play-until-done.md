# play Until Done

Play a built-in melody until it finishes.

```sig
music.baDing.playUntilDone()
```

There are several built-in melodies which you can play in your game. When using blocks, a melody is chosen from a dropdown list. In JavaScript, an instance of one of the built-in melodies is referenced in your code. You call the **playUntilDone** function from that instance of the melody, just like this:

```typescript
music.baDing.playUntilDone()
```

The part of your program that calls **playUntilDone** will wait until the melody is finished playing. After the melody is done playing, your code will continue to run. If you want the code that follows the **playUntilDone** function to continue immediately, you can use [play](/reference/mixer/melody/play-until-done) instead.

## ~ hint

To understand how melodies are created for use in arcade, take a look at the developer [sound](/developer/sound) page.

## ~

## Parameters

* **volume**: an optional sound volume for playing the melody. The volume range is from `0` to `255`. The default volume value is `128`.

## Examples #example

### I'll play 'BaDing' #ex1

Play a the built-in sound called `BaDing`.

```blocks
music.baDing.playUntilDone()
```

### Play 'Power Up' at a low volume #ex2

Play the ``power up`` sound at a volume of `75`.

```blocks
music.powerUp.playUntilDone(75)
```

## See also #seealso

[play](/reference/music/melody/play),
[loop](/reference/music/melody/loop),
[stop](/reference/music/melody/stop)

```package
mixer
```