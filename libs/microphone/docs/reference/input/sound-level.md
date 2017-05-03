# sound level

Returns the level of sounds from ``0``, quiet to ```1023`` loud.

```sig
input.soundLevel()
```

## Example #example

```blocks
loops.forever(() => {
    let level = input.soundLevel();
})
```

```package
microphone
```