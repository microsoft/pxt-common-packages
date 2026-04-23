# create Strip

Get a controller for the default programmable LED strip.

```sig
light.defaultStrip();
```

The default LED strip is either a strip that is onboard or one that is connected to the board but is set as the default.

## Returns

* a new **NeoPixelStrip** controller for the default neopixel strip connected to or existing on the board.

## Example

Get the default pixel strip for the board. Make all pixels light up `green`.

```typescript
const strip = light.defaultStrip( );
strip.setAll(0x00ff00)
```

## See also

[onboard strip](/reference/light/neopixelstrip/onboard-strip),
[range](/reference/light/neopixelstrip/range),
[set mode](/reference/light/neopixelstrip/set-mode)

```package
light
```
