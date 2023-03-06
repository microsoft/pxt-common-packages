# Game

Game control and text display actions.

```cards
game.over()
game.setGameOverEffect(true, effects.confetti)
game.setGameOverMessage(true, "GAME OVER!")
game.setGameOverPlayable(true, music.melodyPlayable(music.powerUp), false)
game.setGameOverScoringType(game.ScoringType.HighScore)
game.onUpdate(function () {})
game.onUpdateInterval(500, function () {})
game.ask("")
game.askForString("")
game.splash("")
game.setDialogCursor(null)
game.setDialogFrame(null)
game.setDialogTextColor(0)
game.showLongText("", DialogLayout.Bottom)
```

## #specific

## See also #seealso

[over](/reference/game/over),
[set game over effect](/reference/game/set-game-over-effect),
[set game over message](/reference/game/set-game-over-message),
[set game over playable](/reference/game/set-game-over-playable),
[set game over scoring type](/reference/game/set-game-over-scoring-type),
[on update](/reference/game/on-update),
[on update interval](/reference/game/on-update-interval),
[ask](/reference/game/ask),
[ask for string](/reference/game/ask-for-string),
[splash](/reference/game/splash),
[set dialog cursor](/reference/game/set-dialog-cursor),
[set dialog frame](/reference/game/set-dialog-frame),
[set dialog text color](/reference/game/set-dialog-text-color),
[show long text](/reference/game/show-long-text)
