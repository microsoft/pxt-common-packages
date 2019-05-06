# end Screen Effect

Stop a built-in effect from displaying on the screen.

```sig
effects.confetti.startScreenEffect()
```

There are several built-in effects you can show on the screen. This will stop the effect you choose if it's currently displaying. In the Blocks editor, you can select an effect from a list in the block. 

## Example #example

Start the ``blizzard`` and ``confetti`` effects on the screen. Wait 5 seconds and then stop only the ``confetti`` effect.

```blocks
effects.blizzard.startScreenEffect()
effects.confetti.startScreenEffect()
pause(5000)
effects.confetti.endScreenEffect()
```

## See also #seealso

[start screen effect](/reference/scene/start-screen-effect)