# check Deep Sleep

Check if the "deep sleep" timeout has elapsed and the device should be put to sleep.

```sig
power.checkDeepSleep()
```

## Returns

* a [boolean](/types/boolean) value that is `true` if the sleep timeout is `0` or `false` if there is time remaining.

## Example #example

Put the device to sleep if the sleep timeout has elapsed.

```blocks{
power.checkDeepSleep()
```

## See also

[set deep sleep timeout](/reference/power/set-deep-sleep-timeout),
[deep sleep](/reference/power/deep-sleep)

```package
power
```