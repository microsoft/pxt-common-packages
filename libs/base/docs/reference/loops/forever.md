# forever

Run a part of the program in the background and keep running it over again.

```sig
forever(() => {
})
```

The code you have in a ``||loops:forever||`` loop will run and keep repeating itself the whole time your
program is active. Code in other parts of your program won't stop while your ``||loops:forever||``
loop is running. This includes other ``||loops:forever||`` loops and the [``||control:run in parallel||``](/reference/control/run-in-parallel) block.

## Parameters

* **a**: the code to keep running over and over again.

## Example #example

Create an mood generator that writes a current mood to the console every `5` seconds.

```blocks
let mood = ["happy", "sad", "joyful", "angry"]
forever(function () {
    console.log("mood = " + mood[Math.randomRange(0, 3)])
    pause(5000)
})
```

## See also #seealso

[while](/blocks/loops/while), [repeat](/blocks/loops/repeat),
[run in parallel](/reference/control/run-in-parallel)
