# Backward

Moves the photon backward by the amount of steps (lights).
If the photon pen is **down**, photon colors the light with the current color.

```sig
photon.backward(1);
```

## Parameters

* **steps**: [number](/reference/blocks/number), the number of lights to back up

## Example #example

In this example, we change the color then move **Photon** by one light in a loop. 
This creates a fun rainbow-like animation.

```blocks
control.forever(() => {
    photon.changeColorBy(5)
    photon.backward(1)
})
```

```package
photon
```
