# Flip

Flips the photon's direction from clockwise to counterclokwise and vice-versa.  

```sig
photon.flip();
```

## Parameters

* **steps**: [number](/reference/blocks/number), the number of lights to advance

## Example

In this example, we randomly flip (or not) the photon on every move.

```blocks
loops.forever(() => {
    photon.forward(1)
    if (Math.random(100) < 30)
        photon.flip();
})
```

```package
photon
```
