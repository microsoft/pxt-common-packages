# log value

Write a **name:value** pair as a line of text to the console output.

```sig
console.logValue("x", 0);
```

A **name:value** pair is a string that has both a name for a value and the value
itself. If you want to send a temperature value of 32 degrees as a _name:value_ pair,
it would go to the console output as this: "temperature:32". This is a good way to
connect a number value to its meaning.

So, ``||console:log value||`` does this but you give the name and the value as two parts and it
sends it as a pair.

## Parameters

* **name**: a [string](/types/string) that is the name part of the _name:value_ pair
* **value**: a [number](/types/number) that is the value part of the _name:value_ pair 

## Example #example

Send _name:value_ pairs for odd and even numbers to the console output.

```blocks
for (let i = 0; i < 10; i++) {
    if (i % 2 > 0) {
        console.logValue("odd", i)
    } else {
        console.logValue("even", i)
    }
}
```

## See also #seealso

[log](/reference/console/log)