# start Screen Effect

Start a displaying a built-in effect on the screen.

```sig
effects.confetti.startScreenEffect()
```

There are several built-in effects you can show on the screen. This will start the effect you choose. In the Blocks editor, you can select an effect from a list in the block.

## Example #example

Start the ``blizzard`` effect on the screen. Wait 5 seconds and then stop the effect.

```blocks
effects.blizzard.startScreenEffect()
pause(5000)
effects.blizzard.endScreenEffect()
```

## See also #seealso

[end screen effect](/reference/scene/end-screen-effect)