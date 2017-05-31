# raise Event

Announce that something happened at an event source.

```sig
control.raiseEvent(0, 0)
```
You use ``||raise event||`` to announce that something happened with the board or something special
happened in your program. You do this if there are other parts of your program that might want
to know about it.

If you've added some [``||on event||``](/reference/control/on-event) blocks to your program,
the code inside them will run if the **src** and **value** numbers are the same as those with
``||raise event||``. The **src** tells about where the event is coming from. You pick a number
for it to identify something like a sensor or a special situation in your program. If you want
to announce that it's getting dark, you can make **src** something like `51` for the light sensor's
source number. This means that anything you want to announce about the light sensor, you raise
event with `51`.

Many events can happen to a single source (**src**). With the light sensor you can announce that
its getting darker or lighter. This is the cause of the event, the **value**. So, for the light
sensor (the source number `51`) you might add two events for **value**: `1` for darker and `2` for lighter.

With the light sensor example, you tell the program that it's getting darker:

```block
control.raiseEvent(51, 1)
```

## Parameters

* **src**: the identification [number](/types/number) (the source) of this event, such as: `10`.
* **value**: a [number](/types/number) tells what the cause of the event is, like: `4`.

## Example #exsection

Register two events coming from source `22`. Make pixels light up on the pixel strip when
the events of `0` and `1` are _raised_.

```blocks
const pixelLighter = 22
control.runInBackground(() => {
    for (let i = 0; i < 2; i++) {
        loops.pause(1000)
        control.raiseEvent(pixelLighter, i)
    }
})

control.onEvent(pixelLighter, 0, () => {
    light.pixels.setPixelColor(0, Colors.Red)
})

control.onEvent(pixelLighter, 1, () => {
    light.pixels.setPixelColor(1, Colors.Blue)
})
```

## See also

[``||on event||``](/reference/control/on-event), [``||wait for event||``](/reference/control/wait-for-event)