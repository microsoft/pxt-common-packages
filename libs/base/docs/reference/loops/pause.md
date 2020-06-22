# pause

Pause a part of the program for some number of milliseconds.

```sig
pause(400)
```

When code in a block comes to a ``||control:pause||``, it will wait the amount of time you tell it to. Code
in blocks like ``||loops:forever||`` and ``||control:run in parallel||`` will keep running while code in some other
block is waiting at a ``||control:pause||``.

## Parameters

* **ms**: the [number](/types/number) of milliseconds that you want to pause for. So, 100 milliseconds = 1/10 second, and 1000 milliseconds = 1 second.

## Example #example

Write the first five natural numbers to the console but wait one-half second between each write.

```blocks
for (let i = 0; i < 5; i++) {
    console.logValue("naturals", i + 1)
    pause(500)
}
```

## See also #seealso

[while](/blocks/loops/while), [for](/blocks/loops/for),
[forever](/reference/loops/forever)
