# on Countdown End

Run some code when the game countdown timer reaches zero.

```sig
info.onCountdownEnd(function () {})
```

If you want to take an action when the game's countdown time reaches `0`, you can put some code in the **onCountdownEnd** function. You might not want the game to end when the countdown goes to `0` but instead have the time reset or restart with different amount of time. This depends on the rules you want to set for your game.

If you've started a the game countdown (using [startCountdown](/reference/info/start-countdown)) and it decreases to `0` but you have no **onCountdownEnd** function in your program, the game will automatically end.

## Parameters

* **handler**: the code to run when the game timer count reaches `0`.

## Example #example

### Game time zero message #ex1

Set the life count to `3`. In the game update function, decrease the life count by `1` each second. Show a message when the life count becomes `0`.

```blocks
info.startCountdown(3)
info.onCountdownEnd(function () {
    game.showLongText("Timer count is zero!", DialogLayout.Bottom)
})
```

### No more time, game over #ex2

Set the game time count to `5` seconds. Run out the time and end the game.

```blocks
info.startCountdown(5)
```

## See also #seealso

[start countdown](/reference/info/start-countdown),
[stop countdown](/reference/info/stop-countdown)
