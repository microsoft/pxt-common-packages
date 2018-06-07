# set Photon Mode

Change the effect of the photon pulse.

```sig
light.createStrip().setPhotonMode(0)
```

The photon can have an effect of lighting the pixel strip to the photon color as the
light pulse moves. This is the `pen down` photon mode. You can also have the light pulse
move across without adding color, or even have it erase the color when it moves.

## Parameters

* **mode**: the pulse effect you want the photon to have. These are:
> * `pen down`: pulse light at each pixel and set it to the photon color.
> * `pen up`: pulse light at each pixel and don't set the color.
> * `eraser`: erase the photon color on the pixel when the pulse hits it.
> * `off`: turns off the photon

## Examples #exsection

### Wig wag #ex1

Move a purple photon across the pixel strip forward and backward. The photon switches modes
so it erases when it moves backward.

```blocks
let strip = light.createStrip()
let forward = true
strip.setPhotonPenHue(191)
forever(() => {
    if (forward) {
        strip.setPhotonMode(PhotonMode.PenDown)
    } else {
        strip.setPhotonMode(PhotonMode.Eraser)
    }
    for (let i = 0; i < strip.length(); i++) {
        strip.photonForward(1)
        pause(100)
    }
    forward = !forward
    strip.photonFlip()
})
```

### Color down, color up #ex2

Flash a purple photon across the pixel strip using `pen down` mode. Switch the mode to
`pen up` and change the photon color to green. Flash another photon and see that the
color stays purple.

```blocks
let strip = light.createStrip()
strip.setPhotonPenHue(191)
strip.setPhotonMode(PhotonMode.PenDown)
for (let i = 1; i < strip.length(); i++) {
    strip.photonForward(1)
    pause(500)
}

strip.setPhotonPenHue(86)
strip.setPhotonMode(PhotonMode.PenUp)
for (let i = 1; i < strip.length(); i++) {
    strip.photonForward(1)
    pause(500)
}
```

### On and Off

Move the photon and turn it off.

```blocks
let strip = light.createStrip()
for (let i = 1; i < strip.length(); i++) {
    strip.photonForward(1)
    pause(500)
}
strip.setPhotonMode(PhotonMode.Off)
```

## See also

[``||photon forward||``](/reference/light/neopixelstrip/photon-forward),
[``||photon flip||``](/reference/light/neopixelstrip/photon-flip),
[``||set photon pen color||``](/reference/light/neopixelstrip/set-photon-pen-color)

```package
light
```


