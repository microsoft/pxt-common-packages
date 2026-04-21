# onboard Strip

Get a controller for the onboard programmable LED strip.

```sig
light.onboardStrip();
```

The onboard LED strip is a strip exits on the board. It is also usually set as the [default strip](/reference/light/neopixelstrip/default-strip).

## Returns

* a new **NeoPixelStrip** controller for the onboard neopixel strip.

## Example

Get the onboard pixel strip for the board. Make all pixels light up `green`.

```typescript
const strip = light.onboardStrip( );
strip.setAll(0x00ff00)
```

## See also

[default strip](/reference/light/neopixelstrip/default-strip),
[range](/reference/light/neopixelstrip/range),
[set mode](/reference/light/neopixelstrip/set-mode)

```package
light
```
