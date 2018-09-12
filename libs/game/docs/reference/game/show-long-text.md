# show Long Text

Show a dialog window with a longer amount of text.

```sig
game.showLongText("", DialogLayout.Bottom)
```

If your to give your player a long message, you can do it with a long text dialog. The dialog appears on the screen at the position you where you want it. The positions are on the sides of the screen, the center, or just the whole screen itself.

When the player is finished reading the message, the dialog is closed by pressing the **A** button and the game continues. If the length of the text shown in the dialog is too long to see all at once, the player can click on the dialog window to scroll it.

## Parameters

* **str**: a [string](/types/string) of text to show in the long text dialog.
* **layout**: the position of the long text dialog on the screen. The positions are:
>* ``left``: dialog is displayed on the left side of the screen
>* ``right``: dialog is displayed on the right side of the screen
>* ``top``: dialog is displayed on the top side of the screen
>* ``bottom``: dialog is displayed on the bottom side of the screen
>* ``center``: dialog is displayed n the center of the screen
>* ``full screen``: dialog is displayed using all of the screen

## Example #example

### Text on all sides #ex1

Show a long text dialog at a different position on the screen for each of the controller buttons pressed.

```blocks
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text on the left", DialogLayout.Left)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text on the right", DialogLayout.Right)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text on the top", DialogLayout.Top)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text on the bottom", DialogLayout.Bottom)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text in the center", DialogLayout.Center)
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText("Long text in full screen", DialogLayout.Full)
})
```

### Scroll the text

Show a very long text string in a long text dialog when button **A** is pressed. Scroll the dialog to see all of the text.

```blocks
let veryLongText = "A very"
for (let i = 0; i < 40; i++) {
    veryLongText = veryLongText + ", very"
}
veryLongText = veryLongText + " long text string!"
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    game.showLongText(veryLongText, DialogLayout.Center)
})
```

[set dialog text color](/reference/game/set-dialog-text-color)
