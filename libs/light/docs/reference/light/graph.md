# graph

Graph a number with the pixels on the pixel strip.

```sig
light.pixels.graph(0, 0);
```
The ``||graph||`` block turns your pixels into a lighted graph to display number values. The total pixels in the
strip make the range for the graph. If you have 20 pixels in your strip and you want to display a
value between `0` and `100`, each pixel lighted amounts to `5`. So, with this range, the value
of `45` will show as 10 pixels on the strip.

For each value, you set **high** as the top of the range and the pixels light up to the point of how
much **value** is a part of **high**.

Also, if use `0` for **high**, the graph will _auto scale_. That means that the largest number you use
in **value** will set the top of the range. This way you can use graph many times, like in a loop, to show
a bunch of numbers where you're not sure what the biggest one will be. Auto scale will reset itself, though, to the
current value if you haven't used ``||graph||`` in the last 10 seconds.

## Parameters

* **value**: a [number](/reference/blocks/number) that is the value to show on the graph.
* **high**: a [number](/reference/blocks/number) that is top number in the graph scale. A value of
`0` lets the graph auto scale.

#### ~hint
The ``||graph||`` block also writes the number from **value** to the serial port as a way to help you record
values.
#### ~

## Examples #exsection

### Graph of ten #ex1

Graph 10 values between 0 and 100 on the pixels.

```blocks
for (let i = 0; i <= 10; i++) {
    light.pixels.graph(i * 10, 100)
    loops.pause(500)
}
```
### Auto range graph #ex2

Graph the value of `1000`. Graph other values but let them auto scale when displayed.

```blocks
light.pixels.graph(1000, 0)
loops.forever(() => {
    light.pixels.graph(Math.random(1000), 0)
    loops.pause(500)
})
```
## See also

[``||range||``](/reference/light/range)

```package
light
```


