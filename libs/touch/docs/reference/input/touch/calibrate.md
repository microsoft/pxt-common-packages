# calibrate

Begin calibrating the touch pin or button.

```sig
input.touchA1.calibrate()
```

Over time, the sensitivity of a touch pin can change. This is due to a change in the surface of the touch area for the pin, such as how clean the pin is, or if the temperature and humidity have changed. If a touch pin takes more or less pressure to detect a pin press than you want, you can start an new calibration.

After starting the calibration, the process will take several touch presses to complete.

## Example #example

Start the touch pin calibration process.

```blocks
input.touchA1.calibrate();
```

## See also #seealso

[set-threshold](/reference/input/touch/set-threshold)

```package
touch
```
