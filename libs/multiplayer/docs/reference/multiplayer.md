# Multiplayer

## Sprite

```cards
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img``))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One))
```

## Information

```cards
mp.playerSelector(mp.PlayerNumber.One)
mp.setPlayerState(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 0)
mp.getPlayerState(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score)
mp.changePlayerStateBy(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 0)
mp.getPlayerByIndex(0)
mp.getPlayerByNumber(0)
```

## Game control

```cards
mp.gameOverPlayerWin(mp.playerSelector(mp.PlayerNumber.One))
mp.setPlayerIndicatorsVisible(true)
```

## Controller

```cards
mp.isButtonPressed(mp.playerSelector(mp.PlayerNumber.One), mp.MultiplayerButton.A)
mp.moveWithButtons(mp.playerSelector(mp.PlayerNumber.One))
mp.onButtonEvent(mp.MultiplayerButton.B, ControllerButtonEvent.Pressed, function (player) {})
```

## Events

```cards
mp.onLifeZero(function (player) {})
mp.onScore(100, function (player) {})
mp.onControllerEvent(ControllerEvent.Connected, function (player) {})
```

## See also

[set player sprite](/reference/multiplayer/set-player-sprite), [get player sprite](/reference/multiplayer/get-player-sprite),
[player selector](/reference/multiplayer/player-selector), [set player state](/reference/multiplayer/set-player-state), [get player state](/reference/multiplayer/get-player-state),
[change player state by](/reference/multiplayer/change-player-state-by), [get player by index](/reference/multiplayer/get-player-by-index),
[get player by number](/reference/multiplayer/get-player-by-number), [game over player win](/reference/multiplayer/game-over-player-win),
[set player indicators visible](/reference/multiplayer/set-player-indicators-visible), [is button pressed](/reference/multiplayer/is-button-pressed),
[move with buttons](/reference/multiplayer/move-with-buttons), [on button event](/reference/multiplayer/on-button-event),
[on life zero](/reference/multiplayer/on-life-zero), [on score](/reference/multiplayer/on-score),
[on controller event](/reference/multiplayer/on-controller-event)

```package
multiplayer
```