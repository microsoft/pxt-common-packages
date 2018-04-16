# set Loud Sound Threshold

Tell how loud it should be for your board to detect a loud sound.

```sig
input.setLoudSoundThreshold(0)
```
When the microphone hears a sound, it gives you a number for how loud the sound was at that moment.
This number is the sound level and has a value from `0` (no sound) to `1023` (very loud). You can use
a sound level number as a _threshold_ (just the right amount of sound) to make the
[``||on loud sound||``](/reference/input/on-loud-sound) event happen.

## Parameters

* **value**: a sound level [number](/types/number) which makes a loudness event happen.

## Example #example

Flash the pixels to `pink` on the pixel strip when you clap or make another loud sound nearby.

```blocks
let pixels = light.createStrip();
input.setLoudSoundThreshold(768);

input.onLoudSound(() => {
	pixels.setAll(0xff007f);
    pause(200);
    pixels.clear();
});
```

## See also #seealso

[on loud sound](/reference/input/on-loud-sound)

```package
microphone
```