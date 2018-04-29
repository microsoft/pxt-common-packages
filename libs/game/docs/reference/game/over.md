# over

Finish the game and show the score.

```sig
game.over()
```

When you end the game, all game control stops and the player gets a message that the game is over (finished). The last action is frozen on the screen and both the current and highest scores are displayed. The game program will reset when you press a key or button.

## Example #example

Check every second to see if the player has any lives left. If not, end the game!

```blocks
game.interval(1000, function () {
	if (info.life() < 1) {
        game.over()
    }
})
```

## See also #seealso

[start countdown](/reference/info/start-countdown)