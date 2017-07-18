# rgb

Combine the red, green, and blue parts of light into an RGB color.

```sig
light.rgb(255, 255, 255);
```
### What's RGB? #rgbdesc

In your programs, light color is known by the amount of three separate colors added
together: **red**, **green**, and **blue**. These colors are known as _primary_ colors and all the
other colors are really a combination of these colors.

Think of taking different colors of paint and mixing them together. Mix an equal amount
of red #paint with an equal amount of green paint. Don't use any blue paint though. What
you get from both red and green is yellow. So, in your program you can make yellow like this:
```block
let yellow = light.rgb(255, 255, 0)
```
In the same way you can make pink but use blue this time and take away the green:
```block
let pink = light.rgb(255, 0, 255)
```

## Parameters

* **red**: a [number](/reference/blocks/number) that is the amount of red light (between 0 and 255), like: 128
* **green**: a [number](/reference/blocks/number) that is the amount green light (between 0 and 255), like: 51
* **blue**: a [number](/reference/blocks/number) that is the amount of blue light (between 0 and 255), like: 255

## Returns

* a [number](/types/number) that is the RGB value for the three color numbers.

## Example

Make a new color of yellow to use on your pixels. Try the new color when you press the ``A`` button.

```blocks
let myYellow = light.rgb(255, 228, 181)
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.setAll(myYellow)
})
```
[``||hsv||``](/reference/light/hsv)

```package
light
```


