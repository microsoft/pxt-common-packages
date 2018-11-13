# stop Countdown

Stops the countdown timer but gameplay continues.

```sig
info.stopCountdown()
```

When you stop the game timer the game continues but the there is no more time limit. You can't resume the countdown from the previous time. You must start the countdown again to reset a time limit for the game.

## Example #example

Set the game time to `30` seconds. Wait `5` seconds, stop the countdown, wait `2` seconds and end the game.

```blocks
info.startCountdown(30)
pause(5000)
info.stopCountdown()
pause(2000)
game.over()
```

## See also #seealso

[start countdown](/reference/info/start-countdown),
[on countdown end](/reference/info/on-countdown-end)
