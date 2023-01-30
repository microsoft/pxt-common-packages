# change Player State By

Change a player state value by some amount.

```sig
mp.changePlayerStateBy(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 0)
```
A [Player](/types/player) state value is changed by adding or subtracting some amount from the current value. The change amount is in the **delta** parameter. If the player's ``||mp:score||`` value is `20` and you want to add `1` to the score, set **delta** to `1`. Similarly, if you want to reduce ``||mp:score||`` to `15`, set **delta** to `-5`.

## Parameters

* **player**: the player to change the a **state** value for.
* **state**: the [state item](/reference/multiplayer/multiplayer-state) to change, such as `score` or `life`.
* **delta**: the amount to change the **state** value by.

## Example #example

Set `player 1` score state to `0`. Send the player's shark sprite across the screen to eat a goldfish on the opposite side. When the shark overlaps the goldfish, add `1` to `player 1` score state.

```blocks
namespace MultiplayerState {
    export const gems = MultiplayerState.create()
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    goldfish.destroy(effects.warmRadial, 200)
    mp.changePlayerStateBy(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 1)
})
let chomp = false
let goldfish: Sprite = null
mp.setPlayerState(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.score, 0)
goldfish = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . c c c c . . . . 
    . . . . . . c c d d d d c . . . 
    . . . . . c c c c c c d c . . . 
    . . . . c c 4 4 4 4 d c c . . . 
    . . . c 4 d 4 4 4 4 4 1 c . c c 
    . . c 4 4 4 1 4 4 4 4 d 1 c 4 c 
    . c 4 4 4 4 1 4 4 4 4 4 1 c 4 c 
    f 4 4 4 4 4 1 4 4 4 4 4 1 4 4 f 
    f 4 4 4 f 4 1 c c 4 4 4 1 f 4 f 
    f 4 4 4 4 4 1 4 4 f 4 4 d f 4 f 
    . f 4 4 4 4 1 c 4 f 4 d f f f f 
    . . f f 4 d 4 4 f f 4 c f c . . 
    . . . . f f 4 4 4 4 c d b c . . 
    . . . . . . f f f f d d d c . . 
    . . . . . . . . . . c c c . . . 
    `, SpriteKind.Food)
goldfish.left = 0
mp.setPlayerSprite(mp.playerSelector(mp.PlayerNumber.One), sprites.create(img`
    .................ccfff..............
    ................cddbbf..............
    ...............cddbbf...............
    ..............fccbbcf............ccc
    ........ffffffccccccff.........ccbbc
    ......ffbbbbbbbbbbbbbcfff.....cdbbc.
    ....ffbbbbbbbbbcbcbbbbcccff..cddbbf.
    ....fbcbbbbbffbbcbcbbbcccccfffdbbf..
    ....fbbb1111ff1bcbcbbbcccccccbbbcf..
    .....fb11111111bbbbbbcccccccccbccf..
    ......fccc33cc11bbbbccccccccfffbbcf.
    .......fc131c111bbbcccccbdbc...fbbf.
    ........f33c111cbbbfdddddcc.....fbbf
    .........ff1111fbdbbfddcc........fff
    ...........cccccfbdbbfc.............
    .................fffff..............
    `, SpriteKind.Player))
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).right = scene.screenWidth()
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).vx = -30
game.onUpdateInterval(500, function () {
    if (chomp == true) {
        mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setImage(img`
            ....................ccfff...........
            ..........fffffffffcbbbbf...........
            .........fbbbbbbbbbfffbf............
            .........fbb111bffbbbbff............
            .........fb11111ffbbbbbcff..........
            .........f1cccc11bbcbcbcccf.........
            ..........fc1c1c1bbbcbcbcccf...ccccc
            ............c3331bbbcbcbccccfccddbbc
            ...........c333c1bbbbbbbcccccbddbcc.
            ...........c331c11bbbbbcccccccbbcc..
            ..........cc13c111bbbbccccccffbccf..
            ..........c111111cbbbcccccbbc.fccf..
            ...........cc1111cbbbfdddddc..fbbcf.
            .............cccffbdbbfdddc....fbbf.
            ..................fbdbbfcc......fbbf
            ...................fffff.........fff
            `)
    } else {
        mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).setImage(img`
            .................ccfff..............
            ................cddbbf..............
            ...............cddbbf...............
            ..............fccbbcf............ccc
            ........ffffffccccccff.........ccbbc
            ......ffbbbbbbbbbbbbbcfff.....cdbbc.
            ....ffbbbbbbbbbcbcbbbbcccff..cddbbf.
            ....fbcbbbbbffbbcbcbbbcccccfffdbbf..
            ....fbbb1111ff1bcbcbbbcccccccbbbcf..
            .....fb11111111bbbbbbcccccccccbccf..
            ......fccc33cc11bbbbccccccccfffbbcf.
            .......fc131c111bbbcccccbdbc...fbbf.
            ........f33c111cbbbfdddddcc.....fbbf
            .........ff1111fbdbbfddcc........fff
            ...........cccccfbdbbfc.............
            .................fffff..............
            `)
    }
    chomp = !(chomp)
})
```

## See also #seealso

[set player state](/reference/multiplayer/set-player-state),
[get player state](/reference/multiplayer/get-player-state)

```package
multiplayer
```