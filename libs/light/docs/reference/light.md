# Light

Light up pixels and NeoPixel strips. Show light effects and animations.

## Pixel #pixel

```cards
light.pixels.showAnimation(null, 0)
light.pixels.showAnimationFrame(null)
light.pixels.stopAllAnimations()
light.animation(LightAnimation.Rainbow)
light.pixels.graph(0, 0)
light.pixels.setAll(0)
light.pixels.show()
light.pixels.setBrightness(0)
light.pixels.setPixelColor(0,0)
light.pixels.clear()
light.pixels.brightness()
light.pixels.pixelColor(0)
```
## NeoPixel #neopixel

```cards
light.createNeoPixelStrip(null, 0)
light.pixels.setPixelWhiteLED(0, 0)
light.pixels.range(0, 0)
light.pixels.length()
light.pixels.move(0, 0)
```
## Photon #photon

```cards
light.pixels.photonForward(0)
light.pixels.photonFlip()
light.pixels.setPhotonColor(0)
light.pixels.setPhotonMode(PhotonMode.PenUp)
```
## Color settings #colorset

```cards
light.rgb(255, 255, 255);
light.hsv(255, 255, 255);
light.colors(Colors.Red);
light.fade(0, 0)
```

```package
light
```
