# Acceleration

Get the acceleration value (milli g-force), in one of the three dimensions.

```sig
input.acceleration(Dimension.X);
```

Find the acceleration of the @boardname@ (how fast it is speeding up or slowing down).

## ~hint

You measure acceleration with the **milli-g**, which is 1/1000 of a **g**.
A **g** is the same amount of acceleration as you get from Earth's gravity.

## ~

### Parameters

* ``dimension`` the direction to check for any acceleration. This is:
> * `X`: left or right
> * `Y`: forward or backward
> * `Z`: up or down

### Returns

* a [number](/types/number) that is the amount of acceleration. When the @boardname@ is lying flat on a surface with the screen pointing up, `x` is `0`, `y` is `0`, and `z` is `-1023`.

### Example: bar chart #example

Show the acceleration of the @boardname@ with a bar graph.

```blocks
loops.forever(() => {
    light.pixels.showBarGraph(input.acceleration(Dimension.X), 1023)
})
```

### See also

[``||set accelerometer range||``](/reference/input/set-accelerometer-range),
[``||light level||``](/reference/input/light-level)


```package
accelerometer
```