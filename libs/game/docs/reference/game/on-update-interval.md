# on Update Interval

Run some code each time an interval of time elapses.

```sig
game.onUpdateInterval(500, function () {
	
})
```

If you want to check a game status or do some regular actions in your game, you can put some code in an interval. The interval sets the time for how often your code will run.

If you have and [on update](/reference/game/on-update) in your program, the code in your interval will run first.

# Parameters

* **period** a [number](/types/number) of milliseconds to wait until you want the interval code to run. 
* **a**: the code to run when the time in **period** has elapsed

## Example #example

Check every second to see if the player has any lives left. If not, end the game!

```blocks
game.onUpdateInterval(1000, function () {
	if (info.life() < 1) {
        game.over()
    }
})
```

## See also #seealso

[update](/reference/game/on-update)