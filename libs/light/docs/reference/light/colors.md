# colors

Get the RGB value of one of the known colors.

```sig
light.colors(Colors.Red);
```

## Parameters

* **color**: a well known color, like: ``pink``

## Example

Make all the pixels light up `red`.

```blocks
light.createStrip().setAll(light.colors(Colors.Red))
```

## See Also

[``||rgb||``](/reference/light/rgb)

```package
light
```
