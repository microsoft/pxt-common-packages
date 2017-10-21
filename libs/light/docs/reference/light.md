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
light.pixels.setBuffered(true)
light.pixels.setBrightness(0)
light.pixels.setPixelColor(0,0)
light.pixels.clear()
light.pixels.brightness()
light.pixels.pixelColor(0)
```
## External Strip #neopixel

```cards
light.createStrip(null, 0)
light.pixels.setPixelWhiteLED(0, 0)
light.pixels.range(0, 0)
light.pixels.length()
light.pixels.move(0, 0)
light.pixels.setMode(NeoPixelMode.RGB)
```
## Photon #photon

```cards
light.pixels.photonForward(0)
light.pixels.photonFlip()
light.pixels.setPhotonPenHue(0)
light.pixels.setPhotonPenColor(0)
light.pixels.setPhotonMode(PhotonMode.PenUp)
```
## Color settings #colorset

```cards
light.rgb(255, 255, 255);
light.hsv(255, 255, 255);
light.colors(Colors.Red);
light.fade(0, 0)
```
## See also #seealso

[showAnimation](/reference/light/show-animation), [showAnimationFrame](/reference/light/show-animation-frame),
[stopAllAnimations](/reference/light/stop-all-animations), [animation](/reference/light/animation),
[graph](/reference/light/graph), [setAll](/reference/light/set-all),
[show](/reference/light/show), [setBuffered](/reference/light/set-buffered), 
[setBrightness](/reference/light/set-brightness),
[setPixelColor](/reference/light/set-pixel-color), [clear](/reference/light/clear),
[brightness](/reference/light/brightness), [pixelColor](/reference/light/pixel-color),
[createStrip](/reference/light/create-strip), [setPixelWhiteLED](/reference/light/set-pixel-white-led),
[range](/reference/light/range), [length](/reference/light/length),
[move](/reference/light/move), [photonForward](/reference/light/photon-forward),
[photonFlip](/reference/light/photon-flip), [setPhotonPenColor](/reference/light/set-photon-pen-color),
[setPhotonPenHue](/reference/light/set-photon-pen-hue),
[setPhotonMode](/reference/light/set-photon-mode), [rgb](/reference/light/rgb),
[hsv](/reference/light/hsv), [colors](/reference/light/colors),
[fade](/reference/light/fade)

```package
light
```
