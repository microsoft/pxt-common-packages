# set Accelerometer Range

Set how the @boardname@ will measure g-force or
[acceleration](/reference/input/acceleration) (how much the @boardname@
is speeding up or slowing down). This block is used to set the most
g-force you will want to measure.

```sig
input.setAccelerometerRange(AcceleratorRange.OneG);
```

### Parameters

* ``range`` the biggest g-force (acceleration) number you will measure: `1g`, `2g`, `4g`, or `8g`.
Any bigger numbers measured by your @boardname@ are ignored. So, you won't receive
events or measurments to your program when a bigger g-force occurs.

### Example #example

Set the highest g-force that your @boardname@
will measure up to 4 g. Then, write to **serial** the acceleration measured when you move the board side to side.

```blocks
input.setAccelerometerRange(AcceleratorRange.FourG)
forever(() => {
    serial.writeNumber(input.acceleration(Dimension.X))
})
```

#### ~hint
**Simulator**

This program only works when on the @boardname@. You have to download it first before trying it out.
#### ~

### See Also

[``||acceleration||``](/reference/input/acceleration)

```package
accelerometer
```