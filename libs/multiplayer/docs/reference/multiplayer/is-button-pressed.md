# is Button Pressed

Check if a controller button for a player is pressed or not.

```sig
mp.isButtonPressed(mp.playerSelector(mp.PlayerNumber.One), mp.MultiplayerButton.A)
```

## Parameters

* **player**: the player to check the controller button state for.
* **button**: the controller button to check for a pressed condition.

## Returns

* a [boolean](/types/boolean) value for the state of the **button** for the **player**. It is `true` if the button is pressed and `false` if the button is not pressed.

## Example #example

If `player 2` is pressing the up arrow button for too long, then`player 1` wins.

```blocks
let pressCount = 0
game.onUpdateInterval(500, function () {
    if (mp.isButtonPressed(mp.playerSelector(mp.PlayerNumber.Two), mp.MultiplayerButton.Up)) {
        pressCount += 1
        if (pressCount > 1) {
            mp.gameOverPlayerWin(mp.playerSelector(mp.PlayerNumber.One))
        }
    } else {
        pressCount = 0
    }
})
```

## See also #seealso

[on button pressed](/reference/multiplayer/on-button-pressed),
[move with buttons](/reference/multiplayer/move-with-buttons)


```package
multiplayer
```