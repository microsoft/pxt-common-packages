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

## Example #example

Create several `Food` sprites at random locations on the screen. Use a sprite kind object for the `Food` identifier to destroy all `Food` srprites.

```blocks
let mySprite: Sprite = null
let foodKind = SpriteKind.Food
for (let index = 0; index <= 4; index++) {
    mySprite = sprites.create(img`
        . . . . c c c b b b b b . . . . 
        . . c c b 4 4 4 4 4 4 b b b . . 
        . c c 4 4 4 4 4 5 4 4 4 4 b c . 
        . e 4 4 4 4 4 4 4 4 4 5 4 4 e . 
        e b 4 5 4 4 5 4 4 4 4 4 4 4 b c 
        e b 4 4 4 4 4 4 4 4 4 4 5 4 4 e 
        e b b 4 4 4 4 4 4 4 4 4 4 4 b e 
        . e b 4 4 4 4 4 5 4 4 4 4 b e . 
        8 7 e e b 4 4 4 4 4 4 b e e 6 8 
        8 7 2 e e e e e e e e e e 2 7 8 
        e 6 6 2 2 2 2 2 2 2 2 2 2 6 c e 
        e c 6 7 6 6 7 7 7 6 6 7 6 c c e 
        e b e 8 8 c c 8 8 c c c 8 e b e 
        e e b e c c e e e e e c e b e e 
        . e e b b 4 4 4 4 4 4 4 4 e e . 
        . . . c c c c c e e e e e . . . 
        `, SpriteKind.Food)
    mySprite.setPosition(randint(0, scene.screenWidth()), randint(0, scene.screenHeight()))
}
for (let value of sprites.allOfKind(foodKind)) {
    pause(1000)
    value.destroy()
}
```

## See also #seealso

[set player state](/reference/multiplayer/set-player-state)


```package
multiplayer
```