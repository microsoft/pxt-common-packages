# run In Background

Run some other code at the same time that your main program code runs.

```sig
control.runInBackground(() => {})
```

Sometimes you want your program to work on more than one thing at a time. The main part of your program is
always put in [``||on start||``](/blocks/on-start). But, you can also put some other part of your
program in ``||control:run in background||``. This is a block that runs code seperately from the code
in ``||on start||``. This is useful when you want your program to keep doing important things
and you don't want to wait for some other actions to happen first.

As an example, you could have a small task to rotate the pixel lights the pixel strip. This is
placed inside a ``||control:run in background||`` block:

```blocks
let spinit = true;
let pixels = light.createStrip();

control.runInBackground(() => {
    while (spinit) {
        pixels.move(LightMove.Rotate, 1);
        loops.pause(200);
    }
})
```
Code is added to the main part of the program to turn the pixels on. It turns on one pixel, waits
for `5` seconds and turns on another pixel. Then, it waits for `5` more seconds and stops the rotate
loop in the background task.

```blocks
let spinit = true;
let pixels = light.createStrip();

pixels.setPixelColor(0, Colors.Blue);
loops.pause(5000);
pixels.setPixelColor(0, Colors.Blue);
loops.pause(5000);
spinit = false;
pixels.clear();
```

## Parameters

* **a**: the code to run in the background.

## Example #exsection

### Pixel conveyor #ex1

Automatically rotate lighted pixels as they are added to the pixel strip.

**First**: As a background task, rotate the lighted pixels on the pixel strip.

**Next**: In the main part of the program, slowly add a few more lights to the strip.

**Finally**: When the `A` button is pressed, stop the rotate task and turn off all the all the pixels.

```blocks
let spinit = false;
let pixels = light.createStrip();

input.buttonA.onEvent(ButtonEvent.Click, () => {
    spinit = false;
    pixels.clear();
})
control.runInBackground(() => {
    pixels.setPixelColor(0, Colors.Blue);
    while (spinit) {
        pixels.move(LightMove.Rotate, 1);
        loops.pause(250);
    }
})
spinit = true;
for (let i = 0; i < 5; i++) {
    loops.pause(1000);
    pixels.setPixelColor(0, Colors.Blue);
}
```