# set Dialog Frame

Set the frame image for the long text dialog window.

```sig
game.setDialogFrame(null)
```
A dialog frame includes the outside edge and the inside of the dialog. You make a dialog frame by creating an [image](/types/image) that has pixels to represent the borders and the inside of the frame.

The frame image needs enough pixels to tell the dialog what the frame design should look like. The simplist frame is a image with 3 rows and 3 columns. This has enough pixels to show what colors the edges have and what color the middle has:

```block
game.setDialogFrame(img`
9 9 9 
9 5 9 
9 9 9 
`)
```

You can change the frame back to the original (default) frame by using an empty image:

```block
game.setDialogFrame(img``)
```

## Parameters

* **frame**: an [image](/types/image) to use as the dialog frame.

## Examples #example

### Simple frame

Show a message in a dialog with a simple frame made from a `3` x `3` image.

```blocks
game.setDialogFrame(img`
3 3 3
3 9 3
3 3 3
`)
game.showLongText("A really simple frame here", DialogLayout.Center)
```

### Fancy frame #ex2

Make an new dialog frame with a fancy border and a color on the inside.

```blocks
game.showLongText("Here's the old frame...", DialogLayout.Center)
game.setDialogFrame(img`
2 2 1 1 2 2 1 1 2 2 1 1 
2 9 9 9 9 9 9 9 9 9 9 1 
1 9 9 9 9 9 9 9 9 9 9 2 
1 9 9 9 9 9 9 9 9 9 9 2 
2 9 9 9 9 9 9 9 9 9 9 1 
2 9 9 9 9 9 9 9 9 9 9 1 
1 9 9 9 9 9 9 9 9 9 9 2 
1 9 9 9 9 9 9 9 9 9 9 2 
2 9 9 9 9 9 9 9 9 9 9 1 
2 9 9 9 9 9 9 9 9 9 9 1 
1 9 9 9 9 9 9 9 9 9 9 2 
1 1 2 2 1 1 2 2 1 1 2 2 
`)
game.showLongText("How do you like my new fancy frame?", DialogLayout.Center)
```

## See also #seealso

[set dialog cursor](/reference/game/set-dialog-cursor),
[set dialog text color](/reference/game/set-dialog-text-color),
[show long text](/reference/game/show-long-text)

