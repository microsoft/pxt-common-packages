# get Player Property

Get the value of a Player property.

```sig
mp.getPlayerProperty(mp.playerSelector(mp.PlayerNumber.One), PlayerProperty.Index)
```

Player properties contain identity information. These are set for a [Player](/types/player) object when it's created to uniquely identfy it. Currently, there are two properties: ``||mp:index||`` and ``||mp:number||``.

## Parameters

* **player**: the [Player](/types/player) to get a property for. item value for.
* **prop**: the property to get a **value** for:
>* `index`: the zero-based index of the Player in the multiplayer object list.
>* `number`: the player identity number of the Player object.

## Returns

* a [number](/types/number) which is the value for the property.

## Example #example

Get the player number property for `player 1` and display it with its character sprite. 

```blocks
scene.setBackgroundColor(10)
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
mp.getPlayerSprite(mp.playerSelector(mp.PlayerNumber.One)).sayText("I'm player " + mp.getPlayerProperty(mp.playerSelector(mp.PlayerNumber.One), mp.PlayerProperty.Number))
```

## See also #seealso

[get player state](/reference/multiplayer/get-player-state)

```package
multiplayer
```