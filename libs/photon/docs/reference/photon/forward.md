# Forward

Moves the photon forward by the amount of steps (lights).
If the photon is **on**, photon colors the light with the current color.

```sig
photon.forward(1);
```

## Parameters

* **steps**: [number](/reference/blocks/number), the number of lights to advance

## Example

In this example, we change the color then move **Photon** by one light in a loop. 
This creates a fun rainbow-like animation.

```blocks
control.forever(() => {
    photon.changeColorBy(5)
    photon.forward(1)
})
```

```package
photon
```
