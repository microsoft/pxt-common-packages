# on Event

Run some code when a registered event happens.

```sig
control.onEvent(0, 0, () => {})
```
Instead of waiting inside of a loop that is part the main program, an event block is
a good way to have some extra code respond to something that happens with the board or
in your program.

It works like this: some code in another part of the program decides it wants to announce
that something special or important just happened. It does this by _raising_ an _event_.
Some other code is placed inside an ``||on event||`` block. The ``||on event||`` block _registers_
itself to run when a matching event is _raised_.

Your program decides what an event should be and makes it official by _registering_ the event along with
a source identification number (id), **src**. The id in **src** is a way to know what **_thing_** is causing an event,
like a sensor, or some special time period that is now over. The **value** tells what the cause of the
event is.

### Why use events?

If you want to run some code when a status changes, you might do it this way
in the main part of the program:

```blocks
let nowStatus = false
control.runInBackground(() => {
    control.waitMicros(10000)
    nowStatus = true
})

let lastStatus = nowStatus;
while(lastStatus == nowStatus) {
    control.waitMicros(1000)
}
```
The [``||while||``](/blocks/loops/while) loop checks for a change in `nowStatus`. The problem is that your program is stuck
in the loop until `nowStatus` changes and it can't do any more work until then.

But, we can change the program to use an event instead of waiting in a loop. Let's register an event
and give it a source identifier, or **src**, of `15` and a cause **value** of `1`:

```blocks
let because = 0;
control.runInBackground(() => {
    control.waitMicros(100000)
    control.raiseEvent(15, 1)
})

control.onEvent(15, 1, () => {
    because = 1;
})
```

So, you see that the program registered an event known as `15`, `1`. The source is known by `15` and the
cause of the event is `1`. Why use these numbers? Well, let's say that you have a moisture sensor connected
to your board. You could make it known to your program that any event that comes from a source of `15` is about your sensor. You can say that a cause of `1` means things are too dry.

## Parameters

* **src**: the identification [number](/types/number) (the source) of this event, such as: `10`.
* **value**: a [number](/types/number) that tells what the cause of the event is, like: `4`.
* **handler**: the code to run when the event happens.

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

[``||raise event||``](/reference/control/raise-event)