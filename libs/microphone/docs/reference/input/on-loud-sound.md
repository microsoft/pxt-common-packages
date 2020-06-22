# on Loud Sound

Run some code when the microphone hears a loud sound.

```sig
input.onLoudSound(function(){});
```

## Parameters

* **handler**: the code to run when a loud sound is heard.

## Example #example

Flash the pixels when a loud sound is detected.

```blocks
let pixels = light.createStrip()

input.onLoudSound(function() {
	pixels.setAll(0xff0000)
	pause(100)
	pixels.setAll(0x000000)
})
```

# See also #seealso

[sound level](/reference/input/sound-level)

```package
microphone
light
```