# multiplayer State

Get a multiplayer state object for a multiplayer state identifier.

```sig
mp._multiplayerState(0)
```

To keep track of different types of sprites, a _kind_ is assigned to them. This is a value that will help identify them and decide what actions to take when events happen in the game. The sprite kinds in your game might be defined like this:

```typescript-ignore
namespace MultiplayerState {
    export const score = create()
    export const life = create()
}
```

In blocks, a sprite kind identifier is used to make a sprite kind item that can be assigned to a variable or used as a parameter:

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

* **kind**: the multiplayer state identifier to get the state object for.

## Returns

* a multiplayer state object for a multiplayer state identifer.

## See also #seealso

[set player state](/reference/multiplayer/set-player-state)


```package
multiplayer
```