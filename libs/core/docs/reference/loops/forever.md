# forever

Run a part of the program in the background and keep running it over again.

```sig
loops.forever(() => {
})
```

The code you have in a ``||forever||`` loop will run and keep repeating itself the whole time your
program is active. Code in other parts of your program won't stop while your ``||forever||``
loop is running. This includes other ``||forever||`` loops and the [``||run in background||``](/reference/control/run-in-background) block.

## Parameters

* **a**: the code to keep running over and over again.

## Example

Rotate a blue pixel along the pixel strip (one pixel at a time) and keep it rotating.

```blocks
let lightSpot = 0;
loops.forever(() => {
    if (lightSpot == light.pixels.length()) {
        lightSpot = 0;
    }
    light.pixels.setPixelColor(lightSpot, Colors.Blue)
    loops.pause(500)
    light.pixels.setPixelColor(lightSpot, Colors.Black)
    lightSpot++
})
```

## See also

[``||while||``](/blocks/loops/while), [``||repeat||``](/blocks/loops/repeat),
[``||run in background||``](/reference/control/run-in-background)
