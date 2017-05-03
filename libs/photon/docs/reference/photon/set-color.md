# Set Color

Sets the photon pen color

```sig
photon.setColor(42);
```

## Parameters

* **color**: [number](/reference/blocks/number), an indexed color value between ``0`` and ``100``.

## Example


```blocks
loops.forever(() => {
    photon.setColor(Math.random(101));
    photon.forward(1);
})
```

```package
photon
```
