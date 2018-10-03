# on Update Interval

Run some code each time an interval of time elapses.

```sig
game.onUpdateInterval(500, function () {
	
})
```

There are events available to run code when sprites overlap, collide, are created, or destroyed. Also, you can use events to take action when buttons are pressed or whe game counts reach zero. When you want to have code to control what happens in a game on a regular basis though, you need to run that code in an update function.

Your program works with the game engine using an update function. The update function is called by the game engine at an interval of time that you choose. Inside the update function, you might put in code that checks positions of sprites, conditions that change the score, adjust the life count, or maybe if something happened to end the game.

With **onUpdateInterval**, you decide how often you want your update code to run. This is different from [onUpdate](/reference/game/on-update) where the game engine decides when to run your update code.

If your program has both [onUpdate](/reference/game/on-update) and **onUpdateInterval** functions, the code in your **onUpdateInterval** function will run first.

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

[on update](/reference/game/on-update)