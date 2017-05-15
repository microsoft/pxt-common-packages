# color Wipe Animation

Return a new instance of the color wipe animation.

```
light.colorWipeAnimation(0xff000)
```

## Parameters

* **rgb**: [number](/reference/blocks/number), 

## Example

```blocks
loops.forever(() => {
    light.builtin.showAnimationFrame(light.colorWipeAnimation(light.colors(Colors.Red)))
})
```

## See Also


```package
light
```
