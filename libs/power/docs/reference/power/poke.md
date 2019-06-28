# Poke

Notifies power management that some activity has happened and the sleep timeout should reset.

```sig
power.poke();
```

If a "deep sleep" timeout is set and you want the device to continue to remain awake for another sleep timeout duration, you can _poke_ it. A poke is just a reset of the deep sleep timeout duration back to amount of time when countdown began. The timeout doesn't stop but continues counting down with the full amount of time remaining.

## Example

Poke the device to stay awake longer if daylight is detected at a light sensor.

```typescript
const LIGHT_SENSOR_DETECT = 15
const LIGHT_SENSOR_DAYLIGHT = 1

control.onEvent(LIGHT_SENSOR_DETECT, LIGHT_SENSOR_DAYLIGHT, () => {
    power.poke()
})
```

## See also

[set deep sleep timeout](/reference/power/set-deep-sleep-timeout)

```package
power
```