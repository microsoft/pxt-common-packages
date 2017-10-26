# Light

Light up pixels and NeoPixel strips. Show light effects and animations.

## Pixel #pixel

```cards
light.createStrip().showAnimation(null, 0)
light.createStrip().showAnimationFrame(null)
light.createStrip().stopAllAnimations()
light.animation(LightAnimation.Rainbow)
light.createStrip().graph(0, 0)
light.createStrip().setAll(0)
light.createStrip().show()
light.createStrip().setBuffered(true)
light.createStrip().setBrightness(0)
light.createStrip().setPixelColor(0,0)
light.createStrip().clear()
light.createStrip().brightness()
light.createStrip().pixelColor(0)
```
## External Strip #neopixel

```cards
light.createStrip(null, 0)
light.createStrip().setPixelWhiteLED(0, 0)
light.createStrip().range(0, 0)
light.createStrip().length()
light.createStrip().move(0, 0)
light.createStrip().setMode(NeoPixelMode.RGB)
```
## Photon #photon

```cards
light.createStrip().photonForward(0)
light.createStrip().photonFlip()
light.createStrip().setPhotonPenHue(0)
light.createStrip().setPhotonPenColor(0)
light.createStrip().setPhotonMode(PhotonMode.PenUp)
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
