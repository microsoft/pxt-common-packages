# start Countdown

Start the countdown timer for the amount of gameplay time. The current game lasts for this amount of time.

```sig
info.startCountdown(0)
```

The game time is set as a number of seconds. When the game time finishes, a game over notification happens and the current game ends.

## Parameters

* **duration**: the [number](/types/number) seconds to play the game for.

## Example #example

Set the game time to `30` seconds.

```blocks
info.startCountdown(30)
```

## See also #seealso

[set score](/reference/info/set-score),
[stop countdown](/reference/info/stop-countdown),
[on countdown end](/reference/info/on-countdown-end)
