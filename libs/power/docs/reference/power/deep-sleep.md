# deep Sleep

Set the device into a low-power consumption mode, or "deep sleep".

```sig
power.deepSleep()
```

In order to conserve power when there's no user input to process, events to handle, or indications to display, a device can go into a "deep sleep" state. In a deep sleep state the device stops normal processing of user programs and input events. During deep sleep the device may only respond to certain interrupts and necessary timer events.

To bring the device out of deep sleep a hardware event, like pressing the reset button, may be required.

```blocks
console.log("Feeling tired now. I'm going to sleep.");
power.deepSleep()
```

```package
power
```

## See also

[set deep sleep timeout](/reference/power/set-deep-sleep-timeout)