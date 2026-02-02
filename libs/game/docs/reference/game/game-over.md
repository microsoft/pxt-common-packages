# game Over

Finish the game and show the score.

```sig
game.gameOver(false)
```

When you end the game, all game control stops and the player gets a message that the game is over (finished). The last action is frozen on the screen and both the current and highest scores are displayed. The game program will reset when you press a key or button.

If a game over message set for a win or lose, it is displayed. If a game over effect is set, then it also is shown and a game over sound if one is also set. If no message, effect, or sound is set for either win or lose, then a default is used.

## Parameters

* **win**: an optional [boolean](/types/boolean) value to say if the player has won the game.

## Example #example

### No lives? Game Over #ex1

Check every second to see if the player has any lives left. If not, end the game!

```blocks
game.onUpdateInterval(1000, function () {
	if (info.life() < 1) {
        game.setGameOverEffect(false, effects.dissolve)
        game.gameOver(false)
    }
})
```

### Show Game Over effect #ex2

When the game score reaches `20`, end the game and show the ``bubbles`` effect.

```blocks
game.onUpdateInterval(100, function () {
    info.changeScoreBy(1)
})
game.onUpdate(function () {
    if (info.score() > 20) {
        game.setGameOverEffect(false, effects.bubbles)
        game.gameOver(false)
    }
})
```

## See also #seealso

[start countdown](/reference/info/start-countdown),
[set game over effect](/reference/game/set-game-over-effect),
[set game over message](/reference/game/set-game-over-message),
[set game over playable](/reference/game/set-game-over-playable)
