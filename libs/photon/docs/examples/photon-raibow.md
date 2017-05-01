# Photon Rainbow

```blocks
control.forever(() => {
    photon.changeColorBy(5)
    photon.forward(1)
    control.pause(50)
})
```

```package
light
photon
```