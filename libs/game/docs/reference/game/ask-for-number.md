# ask For Number

Ask the player for a number value.

```sig
game.askForNumber("")
```

The player is prompted to input a number. Your message is displayed and the player uses the number pad to select the number they want to return. Each digit of the response is selected with the **A** button. You can limit the number of digits the player can type in the response.

The player selects **OK** and presses the **A** button to finish typing the response. The response string is then returned to your program.

## Parameters

* **message**: a [string](/types/string) that is the prompt message to ask for a response.
* **answerLength**: the [number](/types/number) of digits you want let the player enter. The maximum you can set is `10` and the default is `6`.

## Returns

* a [number](/types/number) value that is the response typed by the player.

## Example #example

Ask the player for how many times the code should repeat.

```blocks
let numOfRepeats = game.askForNumber("How many times should this repeat?")
for (let i = 0; i < numOfRepeats; i++) {
    game.splash("repeated");
}
```

## See also #seealso

[ask](/reference/game/ask),
[ask for string](/reference/game/ask-for-string)