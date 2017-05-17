# on Loud Sound

Run some code when a loud sound is detected

```sig
input.onLoudSound(() => {});
```

## Parameters

* **handler**: the code to run sound conditions change

## Example

Dim the red pixels to half their brightness when sounds are quiet.

```blocks
input.onLoudSound(() => {
	light.pixels.setAll(Colors.Red);
	loops.pause(100);
	light.pixels.setAll(Colors.Black);
})
```
# See also

[``||sound level||``](/reference/input/sound-level)

```package
microphone
light
```