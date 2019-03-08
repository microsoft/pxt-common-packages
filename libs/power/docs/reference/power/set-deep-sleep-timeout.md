# set Deep Sleep Timeout

Specify the inactivity duration **in seconds** required to enter deep sleep.

```sig
power.setDeepSleepTimeout(10)
```

You can set a timeout for the device to go into "deep sleep" when it has no current activity. The time is set as a number of seconds.

## Parameters

* **seconds**: a [number](types/number) of seconds to wait for any system activity before the device will go into deep sleep.

## Example #example

Set the inactivity timeout to `30` seconds.

```blocks
power.setDeepSleepTimeout(30)
```

## See also

[check deep sleep](/reference/power/check-deep-sleep),
[poke](/reference/power/poke)

```package
power
```