# multiplayer State

Get the value of a player state identifier.

```sig
mp._multiplayerState(0)
```

To keep track of different multiplayer states, a _kind_ is assigned to them. This is a value that identifies one of the states set for a [Player](/types/player). The multiplayer state values in your game might be defined like this:

```typescript-ignore
namespace MultiplayerState {
    export const score = create()
    export const life = create()
}
```

In blocks, a multiplayer state kind identifier is used to make a state kind item that can be assigned to a variable or used as a parameter:

```block
let lifeState = MultiplayerState.life
```

In blocks, the multiplayer state list lets you add your own custom state identifers to it. Let's say you wanted to give players 'gems' as rewards during a game. When you add `gems` to the state list, it also adds a new state constant called `gems` to your project code:

```typescript-ignore
namespace MultiplayerState {
    export const gems = create()
}
```

You can now set state values for the number of `gems` you give a player.

```blocks
namespace MultiplayerState {
    export const gems = create()
}
mp.setPlayerState(mp.playerSelector(mp.PlayerNumber.One), MultiplayerState.gems, 6)
```

## Parameters

* **kind**: the multiplayer state identifier to get the state value for.

## Returns

* a value for a player state identifier.

## See also #seealso

[set player state](/reference/multiplayer/set-player-state)

```package
multiplayer
```