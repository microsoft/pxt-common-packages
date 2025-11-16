# animation

Return an instance of the selected builtin animation.

```sig
light.animation(LightAnimation.Sparkle)
```

## Parameters

* **kind**: the type of animation to select, one of the following:

>* `running lights`
>* `comet`
>* `color wipe`
>* `theater chase`
>* `rainbow`

## Example

Show the `rainbow` animation continuously at `500` millisecond intervals.

```blocks
forever(function() {
    light.showAnimation(LightAnimation.Rainbow, 500)
})
```

## See Also

```package
light
```
