# ask

Ask the player a 'yes' or 'no' question which answered with the **A** or **B** button.

```sig
game.ask("")
```

You ask a question which the player answers by pressing either the **A** or **B** button. If the player presses **A**, a `true` condition results. If the **B** button is pressed, the condition is `false`. You can include an optional subtitle as a second part of your question.

## Parameters

* **title**: a [string](/types/string) that has the text of your question.
* **subtitle**: a [string](/types/string) that is an optional second part of your question.

## Returns

* a [boolean](/types/boolean) value that is `true` if the player pressed **A** in response to your question and `false` if the player pressed **B**.

## Example #example

Ask the player if they're ready to play the next game level. If so, set the score to `0`. Otherwise, finish the game.

```blocks
if (game.ask("Ready to play?", "Next: advanced level")) {
    info.setScore(0)
} else {
    game.over()
}
```

## See also #seealso

[ask for string](/reference/game/ask-for-string)