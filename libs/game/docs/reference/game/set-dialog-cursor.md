# set Dialog Cursor

Set the image for the dialog cursor.

```sig
game.setDialogCursor(null)
```

The dialog cursor is a small image that shows inside the dialog frame. It's used to show the player which button causes the dialog to close. You can change the way the cursor looks by setting a different image for it.

You can change the frame back to the original (default) cursor by using an empty image:

```block
game.setDialogCursor(img``)
```

## Parameters

* **cursor**: an [image](/types/image) to use as the dialog cursor.

## Examples #example

Make a new round cursor image with a bold letter inside. Set the image as the new dialog cursor.

```blocks
game.setDialogCursor(img`
. . 8 8 8 8 8 8 . . 
. 8 8 8 1 1 8 8 8 . 
8 8 8 1 8 8 1 8 8 8 
8 8 8 1 1 1 1 8 8 8 
8 8 8 1 8 8 1 8 8 8 
8 8 8 1 8 8 1 8 8 8 
. 8 8 8 8 8 8 8 8 . 
. . 8 8 8 8 8 8 . . 
`)
game.showLongText("A new, much bolder cursor!", DialogLayout.Center)
```

## See also #seealso

[set dialog frame](/reference/game/set-dialog-frame),
[set dialog text color](/reference/game/set-dialog-text-color),
[show long text](/reference/game/show-long-text)

