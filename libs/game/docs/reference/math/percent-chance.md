# percent Chance

Return a boolean value that is true a given percentage of the time.

```sig
Math.percentChance(0)
```

## Parameters

* **percentage**: a [number](/types/number) which is the percentage chance that the returned value will be `true`. The percentage is a value beteen `0` and `100`.

## Returns

* a [boolean](/types/boolean) that is `true` for the **percentage** of chance given.

## Example #example

Simulate picking the number `1` when rolling dice. Use a percentage chance to see
if your number is rolled.

```blocks
let isOne = Math.percentChance(100 / 6)
```

## See Also

[random range](/reference/math/random-range)