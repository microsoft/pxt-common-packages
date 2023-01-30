# on Button Event

Run some code when a button on a player's controller is pressed or released.

```sig
mp.onButtonEvent(mp.MultiplayerButton.B, ControllerButtonEvent.Pressed, function (player) {})
```

You can detect a controller button action on a player's controller and run some code in response. A button is chosen and a type of event is selected.

## Parameters

* **button**: the button to detect an action for:
>* `A` button
>* `B` button
>* `up` arrow key
>* `down` arrow key
> * `left` arrow key
> * `right` arrow key
* **event**: the button event to detect:
> * `pressed`: a button or arrow key is pressed
> * `released`: a button or arrow key is released
> * `repeat`: a button or arrow key is press quickly, multiple times
* **handler**: the code to run the button event happens.

## Example #example

```blocks
mp.onButtonEvent(mp.MultiplayerButton.A, ControllerButtonEvent.Pressed, function (player2) {
    mp.getPlayerSprite(player2).sayText("I'm pressed!", 500, false)
})
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.One), sprites.create(img`
    . . . . . f f f f f . . . . . . 
    . . . . f e e e e e f . . . . . 
    . . . f d d d d d d e f . . . . 
    . . f d f f d d f f d f f . . . 
    . c d d d e e d d d d e d f . . 
    . c d c d d d d c d d e f f . . 
    . c d d c c c c d d d e f f f f 
    . . c d d d d d d d e f f b d f 
    . . . c d d d d e e f f f d d f 
    . . . . f f f e e f e e e f f f 
    . . . . f e e e e e e e f f f . 
    . . . f e e e e e e f f f e f . 
    . . f f e e e e f f f f f e f . 
    . f b d f e e f b b f f f e f . 
    . f d d f f f f d d b f f f f . 
    . f f f f f f f f f f f f f . . 
    `, SpriteKind.Player))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setBounceOnWall(true)
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setVelocity(40, -30)
```
## See also #seealso

[is button pressed](/reference/multiplayer/is-button-pressed),
[move with buttons](/reference/multiplayer/move-with-buttons)

```package
multiplayer
```