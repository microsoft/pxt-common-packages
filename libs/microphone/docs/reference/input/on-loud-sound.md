# on Loud Sound

Run some code when the microphone hears a loud sound.

```sig
input.onLoudSound(() => {});
```

## Parameters

* **handler**: the code to run when a loud sound is heard.

## Example

Flash the pixels when a loud sound is detected.

```blocks
let pixelStrip = light.createStrip()
input.onLoudSound(() => {
	pixelStrip.setAll(Colors.Red);
	loops.pause(100);
	pixelStrip.setAll(Colors.Black);
})
```
# See also

[``||sound level||``](/reference/input/sound-level)

```package
microphone
light
```