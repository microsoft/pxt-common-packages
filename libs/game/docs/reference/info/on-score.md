# on Score

Run some code once when the player's score reaches the given value. This code will also run once if the score "passes" the given value after being changed by a value greater than 1.

```sig
info.onScore(100, function () {})
```

## Parameters

* **score**: the target score value for this event to run
* **handler**: the code to run when the score reaches or passes the target value.

## Example #example

### Clicker game #ex1

Change the player's score by 1 each time a button is pressed and show some text when the score reaches 100!

```blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    info.changeScoreBy(1)
})
info.onScore(100, function () {
    game.splash("Score is " + info.score())
})

```

### Multiplayer #ex2

Randomly give either player 1 or player 2 a point on each game update. The first player to reach 100 wins!

```blocks
info.player2.onScore(100, function () {
    game.splash("Player 2 wins!")
    game.reset()
})
info.player1.onScore(100, function () {
    game.splash("Player 1 wins!")
    game.reset()
})
game.onUpdate(function () {
    if (Math.percentChance(50)) {
        info.player1.changeScoreBy(1)
    } else {
        info.player2.changeScoreBy(1)
    }
})

```

### Passing the target score #ex3

This example demonstrates what happens when the score is changed by a value greater than 1. When the A button is pressed, the player's score
changes by 10. The event still runs even though it's looking for a score of 5!

```blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    info.changeScoreBy(10)
})
info.onScore(5, function () {
    game.splash("Score is " + info.score())
})

```

## See also #seealso

[score](/reference/info/score),
[set score](/reference/info/set-score),
[change score by](/reference/info/change-score-by)