# Player

A **Player** is a game object representing one of the players in a [multiplayer](/reference/multiplayer)
game. A Player object has entities, information, and actions associated with it related to an actual player's state in a game.

Typically, a Player object is assigned a character [Sprite](/types/sprite) and keeps track of it's current score, life points, etc. Actions like controller inputs and connection status are tracked for a Player also.

Player objects are usually referenced using a selector named as the player's number.

```block
let myPlayer = mp.playerSelector(mp.PlayerNumber.One)
```

Similarly in Javascript, `myPlayer` is a `Player` object and is set using the selector for ``||mp:player 1||``:

```typescript-ignore
let myPlayer: mp.Player = null

myPlayer = mp.playerSelector(mp.PlayerNumber.One)
```

## Example #example

```blocks
namespace MultiplayerState {
    export const gems = MultiplayerState.create()
}
mp.onControllerEvent(ControllerEvent.Connected, function (player) {
    if (player == mp.playerSelector(mp.PlayerNumber.Two)) {
        mp.getPlayerSprite(player).sayText("Player 2 is on!")
    }
})
mp.onScore(100, function (player) {
    if (player == mp.playerSelector(mp.PlayerNumber.One)) {
        mp.gameOverPlayerWin(mp.playerSelector(mp.PlayerNumber.One))
    }
})
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img`
    . . 4 4 4 . . . . 4 4 4 . . . . 
    . 4 5 5 5 e . . e 5 5 5 4 . . . 
    4 5 5 5 5 5 e e 5 5 5 5 5 4 . . 
    4 5 5 4 4 5 5 5 5 4 4 5 5 4 . . 
    e 5 4 4 5 5 5 5 5 5 4 4 5 e . . 
    . e e 5 5 5 5 5 5 5 5 e e . . . 
    . . e 5 f 5 5 5 5 f 5 e . . . . 
    . . f 5 5 5 4 4 5 5 5 f . . f f 
    . . f 4 5 5 f f 5 5 6 f . f 5 f 
    . . . f 6 6 6 6 6 6 4 4 f 5 5 f 
    . . . f 4 5 5 5 5 5 5 4 4 5 f . 
    . . . f 5 5 5 5 5 4 5 5 f f . . 
    . . . f 5 f f f 5 f f 5 f . . . 
    . . . f f . . f f . . f f . . . 
    `, SpriteKind.Player))
mp.moveWithButtons(mp.playerSelector(mp.PlayerNumber.One))
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.Two), sprites.create(img`
    . . . . f f f f f . . . . . . . 
    . . . f e e e e e f . . . . . . 
    . . f d d d d e e e f . . . . . 
    . c d f d d f d e e f f . . . . 
    . c d f d d f d e e d d f . . . 
    c d e e d d d d e e b d c . . . 
    c d d d d c d d e e b d c . . . 
    c c c c c d d e e e f c . . . . 
    . f d d d d e e e f f . . . . . 
    . . f f f f f e e e e f . . . . 
    . . . . f f e e e e e e f . f f 
    . . . f e e f e e f e e f . e f 
    . . f e e f e e f e e e f . e f 
    . f b d f d b f b b f e f f e f 
    . f d d f d d f d d b e f f f f 
    . . f f f f f f f f f f f f f . 
    `, SpriteKind.Player))
mp.moveWithButtons(mp.playerSelector(mp.PlayerNumber.Two))
```

# See also #seealso

[multiplayer](/reference/multiplayer)

```package
multiplayer
```
