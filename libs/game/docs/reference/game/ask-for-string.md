# ask For String

Ask the player for a string value.

```sig
game.askForString("")
```

The player is prompted to input a string. Your message is displayed and the player chooses from character selections below it to make a response. Each character of the response string is selected with the **A** button. You can limit the number of characters they player can type in the response.

The player selects **OK** and presses the **A** button to finish typing the response. The response string is then returned to your program.

## Parameters

* **message**: a [string](/types/string) that is the prompt message to ask for a response.
* **answerLength**: the [number](/types/number) of characters you want let the player enter. The maximum you can set is `24` and the default is `12`.

## Returns

* a [string](/types/string) value that is the response typed by the player.

## Example #example

Ask the player for a unlock code to continue playing the game.

```blocks
let unlock = "98745"
if (game.askForString("unlock code:", 5) != unlock) {
    game.over()
}
```

## See also #seealso

[ask](/reference/game/ask)