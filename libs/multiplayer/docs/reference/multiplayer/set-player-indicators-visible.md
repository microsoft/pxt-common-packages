# set Player Indicators Visible

```sig
mp.setPlayerIndicatorsVisible(true)
```

## Paramters

* **visible**: a [boolean](/types/boolean) value that when set `true` the player's indicating information is visible to other players. Otherwise, if set `false`, the indicators aren't displayed on other player's screens.

## Example

When `player 1` presses button `B`, they go "anonymous" and their indicators aren't displayed.

```blocks
mp.onButtonEvent(mp.MultiplayerButton.B, ControllerButtonEvent.Pressed, function (player2) {
    mp.setPlayerIndicatorsVisible(true)
})
```
