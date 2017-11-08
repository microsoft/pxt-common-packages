# Light

Light up pixels and NeoPixel strips. Show light effects and animations.

## #onboard

## External NeoPixel strip #neopixel

```cards
light.createStrip(null, 0)
light.createStrip().showAnimation(null, 0)
light.createStrip().showAnimationFrame(null)
light.createStrip().stopAllAnimations()
light.createStrip().graph(0, 0)
light.createStrip().setAll(0)
light.createStrip().show()
light.createStrip().setBrightness(0)
light.createStrip().setPixelColor(0,0)
light.createStrip().clear()
light.createStrip().brightness()
light.createStrip().pixelColor(0)
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
//light.fade(0, 0)
//light.animation(LightAnimation.Rainbow)
```

## See also #seealso

## #baselinks

[showAnimation](/reference/light/neopixelstrip/show-animation), [showAnimationFrame](/reference/light/neopixelstrip/show-animation-frame),
[stopAllAnimations](/reference/light/neopixelstrip/stop-all-animations), [animation](/reference/light/animation),
[graph](/reference/light/neopixelstrip/graph), [setAll](/reference/light/neopixelstrip/set-all),
[show](/reference/light/neopixelstrip/show), [setBuffered](/reference/light/neopixelstrip/set-buffered), 
[setBrightness](/reference/light/neopixelstrip/set-brightness),
[setPixelColor](/reference/light/neopixelstrip/set-pixel-color), [clear](/reference/light/neopixelstrip/clear),
[brightness](/reference/light/neopixelstrip/brightness), [pixelColor](/reference/light/neopixelstrip/pixel-color),
[createStrip](/reference/light/create-strip), [setPixelWhiteLED](/reference/light/neopixelstrip/set-pixel-white-led),
[range](/reference/light/neopixelstrip/range), [length](/reference/light/neopixelstrip/length),
[move](/reference/light/neopixelstrip/move), [photonForward](/reference/light/neopixelstrip/photon-forward),
[photonFlip](/reference/light/neopixelstrip/photon-flip), [setPhotonPenColor](/reference/light/neopixelstrip/set-photon-pen-color),
[setPhotonPenHue](/reference/light/neopixelstrip/set-photon-pen-hue),
[setPhotonMode](/reference/light/neopixelstrip/set-photon-mode), [rgb](/reference/light/rgb),
[hsv](/reference/light/hsv), [colors](/reference/light/colors),
[fade](/reference/light/fade)

```package
light
```
