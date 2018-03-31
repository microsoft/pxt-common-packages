# pause Until

Pause the current part of the program until a condition becomes true.

```sig
pauseUntil(() => true)
```

Sometimes you need to wait in one part of a program for something to happen somewhere else in the program. This is done by pausing until some condition elsewhere becomes ``true``. Such a condition could be a value you set in an event block or a function that returns a [boolean](/types/boolean) .

## Parameters

* **condition**: a [boolean](/types/boolean) condition that restarts the program when it becomes ``true``.
* **timeOut**: an optional paramenter which is a [number](/types/number) of milliseconds to wait for the **condition** to become ``true``. The pause ends when the timeout has elapsed even if **condition** is still ``false``.

## ~hint

The code you have in **events** or inside **runInParallel** blocks will continue to execute while the current part of your program is paused.

## ~

## Examples #example

### Timer in a parallel block #ex1

Make a `5` second timer by counting time in a parallel code section.

```blocks
let msecs = 0
control.runInParallel(function () {
    while (true) {
        control.waitMicros(1000)
        msecs += 1
    }
})
pauseUntil(() => msecs > 5000)
```

### Timer in a boolean function #ex2

Wait on a five second timer function.

```typescript
function waitFiveSeconds() : boolean {
    for (let i = 0; i < 5000; i++) {
        control.waitMicros(1000)
    }
    return true
}
pauseUntil(() => waitFiveSeconds())
```

## #seealso