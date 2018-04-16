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

Rotate a blue pixel along the pixel strip (one pixel at a time) and keep it rotating.

```blocks
let lightSpot = 0;
let pixels = light.createStrip();
forever(() => {
    if (lightSpot == light.pixels.length()) {
        lightSpot = 0;
    }
    pixels.setPixelColor(lightSpot, 0x0000ff);
    pause(500);
    pixels.setPixelColor(lightSpot, 0x000000);
    lightSpot++;
})
```

## See also #seealso

[while](/blocks/loops/while), [repeat](/blocks/loops/repeat),
[run in parallel](/reference/control/run-in-parallel)
