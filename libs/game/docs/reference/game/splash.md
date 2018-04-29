# splash

Show a title and a subtitle on the screen.

```sig
game.splash("")
```

You can splash a title on the screen at the beginning of your game or at sometime later in the game. To show more information, add an optional subtitle string. The splash text goes away when you press a key or button.

## Parameters

* **title**: a [string](/types/string) that is your splash text.
* **subtitle**: a [string](/types/string) that is an optional second line of splash text.

## Example #example

Show the title screen of the game before showing the menu.

```blocks
game.splash("Magical Forest", "Find your way out!!!")
let choice = game.askForString("Choose game: (1) Thick Woods, (2) Valley Grove", 1)
```

## See also #seealso

[ask](/reference/game/ask)