# hsv

Turn a HSV (hue, saturation, value) color number into an RGB color number.

```sig
light.hsv(255, 255, 255);
```
### What's HSV? #hsvdesc

In your programs, color is known by [RGB](/reference/light/rgb#rgbdesc) numbers.
Another way to make color is with the **HSV** method. HSV means **hue**, **saturation**, and
**value**. Sounds complicated but maybe there's a way to think about that's simple.

The first part, **hue**, is the color. A hue number of `0` means red and a hue number of `255`
means violet. All of the other colors are in between those numbers.

The next number, **saturation**, is the amount of white light mixed in with _hue_. If this
number is `0`, then the color of _hue_ is all washed away and you get some shade of grey or maybe
just white. But, when you set it to `255`, you have the full amount of the _hue_ color.

The last number, **value** is how dark or light the color will be. Using `0` makes every color go
to black and using `255` makes every color go to white. Some number in between is your color at some
amount of darkness. Of course, `128` is average darkness and you will clearly see your
color with _value_ set to that.

To make a pure color of blue, the HSV settings are:

```block
let pureBlue = light.hsv(170, 255, 128)
```
If you like a mint color, then use these HSV settings:
```block
let mint = light.hsv(85, 128, 217)
```

## Parameters

* **hue**: a [number](/reference/blocks/number) that is the color (between 0 and 255), like: 92 for green
* **sat**: a [number](/reference/blocks/number) that is the amount of white in the color (between 0 and 255), like: 51
* **val**: a [number](/reference/blocks/number) that is the darkness of the color (between 0 and 255), like: 128

## Returns

* a [number](/types/number) that is the RGB value for the HSV settings.

## Example

Make a new color of yellow to use on your pixels. Try the new color when you press the ``A`` button.

```blocks
let myYellow = light.hsv(43, 228, 217)
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.setAll(myYellow)
})
```
## See also

[``||rgb||``](/reference/light/rgb)

```package
light
```


