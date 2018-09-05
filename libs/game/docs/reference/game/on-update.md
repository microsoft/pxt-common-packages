# on Update

Run game update code.

```sig
game.onUpdate(function () {
	
})
```

There are events available to run code when sprites overlap, collide, are created, or destroyed. Also, you can use events to take action when buttons are pressed or whe game counts reach zero. When you want to have code to control what happens in a game on a regular basis though, you need to run that code in an update function.

Your program works with the game engine using an update function. The update function is called by the game engine at a regular interval. Inside the update function, you might put in code that checks positions of sprites, conditions that change the score, adjust the life count, or maybe if something happened to end the game.

## The Game Loop

On of the basic parts of game programming is the use of a game loop. This is part of the game engine in @boardname@. A game loop keeps the actions in the game moving along. As simple code it might look like this:

```typescript-ignore
while (!gameOver) {
    checkInputs()
    gameUpdate()
    showGameUpdates()
}
```

As part of **gameUpdate**, the code inside your **onUpdate** is run to handle the regular updates that are needed by your game. The time between updates (update frequency) is set by the game engine. This interval is often enough to update the game so that the player is never waiting for your program to make its updates. You put code inside an **onUpdate** that needs to run regularly but doesn't depend on a fixed time interval. If you want update code to run on an interval of time that you choose, then use [onUpdateInterval](/reference/game/on-update-interval).

## Parameters

* **a**: the code to run to move or change the sprites.

## Example #example

Create a sprite and start it moving. In the **onUpdate** function, check if the sprite reaches the edge of the screen. If it does, send it in the opposite direction.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
. . . . . 5 5 5 5 5 5 . . . . . 
. . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
. 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
. . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
. . . . . 5 5 5 5 5 5 . . . . . 
`, SpriteKind.Player)
mySprite.vx = 30
game.onUpdate(function () {
    if (mySprite.x > scene.screenWidth()) {
        mySprite.vx = -30
    } else if (mySprite.x < 0) {
        mySprite.vx = 30
    }
})
```

## See also #seealso

[on update interval](/reference/game/on-update-interval)
