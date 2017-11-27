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
let pixels = light.createStrip()

input.onLoudSound(() => {
	pixels.setAll(Colors.Red);
	loops.pause(100);
	pixels.setAll(Colors.Black);
});
```
# See also

[``||sound level||``](/reference/input/sound-level)

```package
microphone
light
```