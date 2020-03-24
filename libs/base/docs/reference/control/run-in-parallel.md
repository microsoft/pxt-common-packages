# run In Parallel

Run some other code at the same time that your main program code runs.

```sig
control.runInParallel(() => {})
```

Sometimes you want your program to work on more than one thing at a time. The main part of your program is
always put in [``||on start||``](/blocks/on-start). But, you can also put some other part of your
program in ``||control:run in parallel||``. This is useful when you want your program to keep doing important things
and you don't want to wait for some other actions to happen first.

## Separate tasks #tasks

As an example, you could have a small task to rotate a bit in a 16 character
string of zeros. This is placed inside a ``||control:run in parallel||`` block:

```blocks
let bitPos = 0
let rorit = true
let zeros = ""

control.runInParallel(function() {
    while (rorit) {
        if (bitPos > 15) {
            bitPos = 0
        }
        zeros = ""
        for (let i = 0; i < 16; i++) {
            if (bitPos == i) {
                zeros = zeros + "1"
            } else {
                zeros = zeros + "0"
            }
        }
        console.log(zeros)
        pause(200)
    }
})
```

Code is added to the main part of the program to turn the bit rotation on, pause for `5` seconds and then turn it off. It pauses for another `5` seconds and then trys to turn the bit rotation back on. However, the parallel task has finished and
the bit rotation won't start again.

```blocks
let rorit = true
pause(5000)
rorit = false
pause(5000)
rorit = true
```

## Parameters

* **a**: the code to run in the background.

## Example #example

Use a parallel task to generate a magic number. In the main program check the value of the magic number twice. The first time check the value right away. The
second time, check `2` seconds later after the parallel task has time to run.

```blocks
let magic = 0

control.runInParallel(function() {
    magic = Math.randomRange(1000, 5000) 
})

console.logValue("magic", magic)
pause(2000)
console.logValue("magic", magic)
```

## #seealso