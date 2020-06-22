enum DialogLayout {
    //% block=bottom
    Bottom,
    //% block=left
    Left,
    //% block=right
    Right,
    //% block=top
    Top,
    //% block=center
    Center,
    //% block="full screen"
    Full
}

namespace game {
    let dialogFrame: Image;
    let dialogCursor: Image;
    let dialogTextColor: number;

    export class BaseDialog {
        image: Image;
        frame: Image;
        cursor: Image;

        columns: number;
        rows: number;
        unit: number;

        innerLeft: number;
        innerTop: number;
        cursorCount: number;

        font: image.Font;
        textColor: number;

        constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
            this.image = image.create(width, height);

            this.frame = frame || dialogFrame || (dialogFrame = defaultFrame());

            this.font = font || image.font8;

            this.cursor = cursor || dialogCursor || (dialogCursor = defaultCursorImage());

            this.textColor = dialogTextColor == undefined ? dialogTextColor = 15 : dialogTextColor;

            this.unit = Math.floor(this.frame.width / 3);
            this.columns = Math.floor(width / this.unit);
            this.rows = Math.floor(height / this.unit);

            this.innerLeft = (width - (this.columns * this.unit)) >> 1;
            this.innerTop = (height - (this.rows * this.unit)) >> 1;

            this.cursorCount = 0;

            this.drawBorder();
            this.clearInterior();
        }

        update() {
            this.clearInterior();
            this.drawTextCore();
            this.drawCursorRow();
        }

        setText(rawString: string) {
            // implemented by subclass
        }

        drawTextCore() {
            // Implemented by subclass
        }

        drawCursorRow() {
            let offset = 0;
            if (this.cursorCount > 20) {
                offset = 1;
            }

            this.cursorCount = (this.cursorCount + 1) % 40;

            this.image.drawTransparentImage(
                this.cursor,
                this.innerLeft + this.textAreaWidth() + this.unit + offset - this.cursor.width,
                this.innerTop + this.unit + this.textAreaHeight() + 1 - this.cursorRowHeight()
            )
        }

        protected drawBorder() {
            if (this.unit == 1) {
                this.fastFill(0, 0, 0, 1, 1)
                this.fastFill(1, 1, 0, this.columns - 2, 1)
                this.fastFill(2, this.columns - 1, 0, 1, 1)

                this.fastFill(3, 0, 1, 1, this.rows - 2)
                this.fastFill(5, this.columns - 1, 1, 1, this.rows - 2)

                const y = this.rows - 1
                this.fastFill(6, 0, y, 1, 1)
                this.fastFill(7, 1, y, this.columns - 2, 1)
                this.fastFill(8, this.columns - 1, y, 1, 1)

                return
            }

            for (let c = 0; c < this.columns; c++) {
                if (c == 0) {
                    this.drawPartial(0, 0, 0);
                    this.drawPartial(6, 0, this.rows - 1);
                }
                else if (c === this.columns - 1) {
                    this.drawPartial(2, c, 0);
                    this.drawPartial(8, c, this.rows - 1);
                }
                else {
                    this.drawPartial(1, c, 0);
                    this.drawPartial(7, c, this.rows - 1);
                }
            }

            for (let r = 1; r < this.rows - 1; r++) {
                this.drawPartial(3, 0, r);
                this.drawPartial(5, this.columns - 1, r);
            }
        }

        private fastFill(index: number, x: number, y: number, w: number, h: number) {
            const color = this.frame.getPixel(index % 3, Math.idiv(index, 3))
            this.image.fillRect(this.innerLeft + x, this.innerTop + y, w, h, color)
        }

        protected clearInterior() {
            if (this.unit == 1)
                return this.fastFill(4, 1, 1, this.columns - 2, this.rows - 2)

            for (let d = 1; d < this.columns - 1; d++) {
                for (let s = 1; s < this.rows - 1; s++) {
                    this.drawPartial(4, d, s)
                }
            }
        }

        protected drawPartial(index: number, colTo: number, rowTo: number) {
            const x0 = this.innerLeft + colTo * this.unit;
            const y0 = this.innerTop + rowTo * this.unit;

            const xf = (index % 3) * this.unit;
            const yf = Math.idiv(index, 3) * this.unit;

            for (let e = 0; e < this.unit; e++) {
                for (let t = 0; t < this.unit; t++) {
                    this.image.setPixel(
                        x0 + e,
                        y0 + t,
                        this.frame.getPixel(xf + e, yf + t));
                }
            }
        }

        protected cursorRowHeight() {
            return this.cursor.height + 1;
        }

        protected rowHeight() {
            return this.font.charHeight + 1;
        }

        protected textAreaWidth() {
            return this.image.width - ((this.innerLeft + this.unit) << 1) - 2;
        }

        protected textAreaHeight() {
            return this.image.height - ((this.innerTop + this.unit) << 1) - 1;
        }

        protected setFont(font: image.Font) {
            this.font = font;
        }
    }

    export class Dialog extends BaseDialog {
        chunks: string[];
        chunkIndex: number;

        constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
            super(width, height, frame, font, cursor);

            this.chunkIndex = 0;
        }

        hasNext() {
            if (!this.chunks || this.chunks.length === 0) return false;
            return this.chunkIndex < this.chunks.length - 1;
        }

        hasPrev() {
            if (!this.chunks || this.chunks.length === 0) return false;
            return this.chunkIndex > 0;
        }

        nextPage() {
            if (this.hasNext()) {
                this.chunkIndex++;
            }
        }

        prevPage() {
            if (this.hasPrev()) {
                this.chunkIndex--;
            }
        }

        chunkText(str: string): string[] {
            const charactersPerRow = Math.floor(this.textAreaWidth() / this.font.charWidth);
            const charactersPerCursorRow = Math.floor(charactersPerRow - (this.cursor.width / this.font.charWidth));
            const rowsOfCharacters = Math.floor(this.textAreaHeight() / this.rowHeight());
            const rowsWithCursor = Math.ceil(this.cursor.height / this.rowHeight());

            const screens: string[] = [];

            let strIndex = 0;
            let rowIndex = 0;
            let current = "";

            while (strIndex < str.length) {
                const currRowCharacters = rowIndex < rowsOfCharacters - rowsWithCursor ?
                    charactersPerRow : charactersPerCursorRow;
                const lastIndex = strIndex + currRowCharacters - 1;

                if (str.charAt(lastIndex) === " " || lastIndex >= str.length - 1) {
                    current += str.substr(strIndex, currRowCharacters);
                    strIndex += currRowCharacters;
                }
                else if (str.charAt(lastIndex + 1) === " ") {
                    // No need to break, but consume the space
                    current += str.substr(strIndex, currRowCharacters);
                    strIndex += currRowCharacters + 1;
                }
                else if (str.charAt(lastIndex - 1) === " ") {
                    // Move the whole word down to the next row
                    current += str.substr(strIndex, currRowCharacters - 1) + " ";
                    strIndex += currRowCharacters - 1;
                }
                else if (str.charAt(lastIndex - 2) === " ") {
                    // Move the whole word down to the next row
                    current += str.substr(strIndex, currRowCharacters - 2) + "  ";
                    strIndex += currRowCharacters - 2;
                }
                else {
                    // Insert a break
                    current += str.substr(strIndex, currRowCharacters - 1) + "-";
                    strIndex += currRowCharacters - 1;
                }

                rowIndex++;
                if (rowIndex >= rowsOfCharacters) {
                    rowIndex = 0;
                    screens.push(current);
                    current = "";
                }
            }

            // Only pushes the last part of the message to the screen when current isn't empty
            if (current) {
                screens.push(current);
            }

            return screens;
        }

        setText(rawString: string) {
            this.chunks = this.chunkText(rawString);
            this.chunkIndex = 0;
            this.setFont(image.getFontForText(rawString));
        }

        drawTextCore() {
            if (!this.chunks || this.chunks.length === 0) return;
            const str = this.chunks[this.chunkIndex];
            const availableWidth = this.textAreaWidth();
            const availableHeight = this.textAreaHeight();

            const charactersPerRow = Math.floor(availableWidth / this.font.charWidth);
            const charactersPerCursorRow = Math.floor(charactersPerRow - (this.cursor.width / this.font.charWidth));
            const rowsOfCharacters = Math.floor(availableHeight / this.rowHeight());
            const rowsWithCursor = Math.ceil(this.cursor.height / this.rowHeight());

            const textLeft = 1 + this.innerLeft + this.unit + ((availableWidth - charactersPerRow * this.font.charWidth) >> 1);
            const textTop = 1 + this.innerTop + this.unit + ((availableHeight - rowsOfCharacters * this.rowHeight()) >> 1);

            let current = 0;
            for (let row = 0; row < rowsOfCharacters; row++) {
                const currRowCharacters = row % rowsOfCharacters < rowsOfCharacters - rowsWithCursor ?
                    charactersPerRow : charactersPerCursorRow;

                this.image.print(
                    str.substr(current, currRowCharacters),
                    textLeft,
                    textTop + row * this.rowHeight(),
                    this.textColor, this.font
                )
                current += currRowCharacters;
            }
        }
    }

    export class SplashDialog extends game.BaseDialog {
        text: string;
        subtext: string;

        timer: number;
        offset: number;
        maxOffset: number;
        maxSubOffset: number;

        constructor(width: number, height: number) {
            super(width, height, defaultSplashFrame())
            this.maxOffset = -1;
            this.maxSubOffset = -1;
            this.textColor = 1;
        }

        private updateFont() {
            this.setFont(image.getFontForText((this.text || "") + (this.subtext || "")));
        }

        setText(text: string) {
            this.text = text;
            this.updateFont();
            this.offset = 0;
            this.maxOffset = text.length * this.font.charWidth - screen.width + (this.unit << 1);
            this.timer = 2;
        }

        setSubtext(sub: string) {
            this.subtext = sub;
            this.updateFont();
            this.maxSubOffset = sub.length * (this.font.charWidth) - screen.width + (this.unit << 1);
        }

        drawTextCore() {
            const scrollMax = Math.max(this.maxOffset, this.maxSubOffset);
            if (this.timer > 0) {
                this.timer -= game.eventContext().deltaTime;
                if (this.timer <= 0) {
                    if (this.offset > 0) {
                        this.offset = 0;
                        this.timer = 2;
                    }
                }
            }
            else {
                this.offset++;
                if (this.offset >= scrollMax) {
                    this.offset = scrollMax;
                    this.timer = 2;
                }
            }
            const ytitle = 10;
            if (this.maxOffset < 0) {
                const left = (this.image.width >> 1) - (this.text.length * this.font.charWidth >> 1)
                this.image.print(this.text, left, ytitle, this.textColor, this.font)
            }
            else {
                this.image.print(this.text, this.unit - this.offset, ytitle, this.textColor, this.font)
            }

            if (this.subtext) {
                const ysub = ytitle + this.font.charHeight + 2;
                if (this.maxSubOffset < 0) {
                    const left = (this.image.width >> 1) - (this.subtext.length * this.font.charWidth >> 1)
                    this.image.print(this.subtext, left, ysub, this.textColor, this.font);
                }
                else {
                    this.image.print(this.subtext, this.unit - (Math.min(this.offset, this.maxSubOffset)), ysub, this.textColor, this.font);
                }
            }
            this.drawBorder();
        }
    }

    export class GameOverDialog extends game.BaseDialog {
        protected cursorOn: boolean;
        protected isNewHighScore: boolean;

        constructor(
            protected win: boolean,
            protected score?: number,
            protected highScore?: number
        ) {
            super(screen.width(), 46, defaultSplashFrame());
            this.cursorOn = false;
            this.isNewHighScore = this.score > this.highScore;
        }

        displayCursor() {
            this.cursorOn = true;
        }

        update() {
            this.clearInterior();
            this.drawTextCore();

            if (this.cursorOn) {
                this.drawCursorRow();
            }
        }

        drawTextCore() {
            const titleHeight = 8;
            this.image.printCenter(
                this.win ? "YOU WIN!" : "GAME OVER!",
                titleHeight,
                screen.isMono ? 1 : 5,
                image.font8
            );

            if (this.score !== undefined) {
                const scoreHeight = 23;
                const highScoreHeight = 34;
                const scoreColor = screen.isMono ? 1 : 2;

                this.image.printCenter(
                    "Score:" + this.score,
                    scoreHeight,
                    scoreColor,
                    image.font8
                );

                if (this.isNewHighScore) {
                    this.image.printCenter(
                        "New High Score!",
                        highScoreHeight,
                        scoreColor,
                        image.font5
                    );
                } else {
                    this.image.printCenter(
                        "HI" + this.highScore,
                        highScoreHeight,
                        scoreColor,
                        image.font8
                    );
                }
            }
        }
    }

    /**
     * Show a long text string in a dialog box that will scroll
     * using the "A" or "down" buttons. The previous section of the
     * text is shown using the "up" button. This function
     * halts execution until the last page of text is dismissed.
     *
     * @param str The text to display
     * @param layout The layout to use for the dialog box
     */
    //% blockId=game_show_long_text group="Dialogs"
    //% block="show long text %str %layout"
    //% help=game/show-long-text
    export function showLongText(str: string, layout: DialogLayout) {
        controller._setUserEventsEnabled(false);
        game.pushScene();
        game.currentScene().flags |= scene.Flag.SeeThrough;

        let width: number;
        let height: number;
        let top: number;
        let left: number;

        switch (layout) {
            case DialogLayout.Bottom:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = screen.height - height;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Top:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = 0;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Left:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = 0;
                break;
            case DialogLayout.Right:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = screen.width - width;
                break;
            case DialogLayout.Center:
                width = Math.idiv(screen.width << 1, 3);
                height = Math.idiv(screen.width << 1, 3);
                top = (screen.height - height) >> 1;
                left = (screen.width - width) >> 1;
                break;
            case DialogLayout.Full:
                width = screen.width;
                height = screen.height;
                top = 0;
                left = 0;
                break;
        }

        const dialog = new Dialog(width, height);
        const s = sprites.create(dialog.image, -1);
        s.top = top;
        s.left = left;

        dialog.setText(str)
        let pressed = true;
        let done = false;

        let upPressed = true;

        game.onUpdate(() => {
            dialog.update();
            const currentState = controller.A.isPressed() || controller.down.isPressed();
            if (currentState && !pressed) {
                pressed = true;
                if (dialog.hasNext()) {
                    dialog.nextPage();
                }
                else {
                    scene.setBackgroundImage(null); // GC it
                    game.popScene();
                    done = true;
                }
            }
            else if (pressed && !currentState) {
                pressed = false;
            }

            const moveBack = controller.up.isPressed();
            if (moveBack && !upPressed) {
                upPressed = true;
                if (dialog.hasPrev()) {
                    dialog.prevPage();
                }
            }
            else if (upPressed && !moveBack) {
                upPressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
    }

    function defaultFrame() {
        return screen.isMono ?
            img`
        1 1 1
        1 . 1
        1 1 1
        `
            :
            img`
        . . . . . . . . . . . .
        . b b b b b b b b b b .
        . b b b b b b b b b b c
        . b b d 1 1 1 1 d b b c
        . b b 1 1 1 1 1 1 b b c
        . b b 1 1 1 1 1 1 b b c
        . b b 1 1 1 1 1 1 b b c
        . b b 1 1 1 1 1 1 b b c
        . b b d 1 1 1 1 d b b c
        . b b b b b b b b b b c
        . b b b b b b b b b b c
        . . c c c c c c c c c c
        `
    }

    function defaultSplashFrame() {
        return screen.isMono ?
            img`
        1 1 1
        . . .
        1 1 1
        `
            :
            img`
        1 1 1
        f f f
        1 1 1
        `
    }

    function defaultCursorImage() {
        return screen.isMono ?
            img`
        1 1 1 1 1 1 1 . . .
        1 . . 1 . . . 1 . .
        1 . 1 . 1 . . . 1 .
        1 . 1 1 1 . . . . 1
        1 . 1 . 1 . . . 1 .
        1 . . . . . . 1 . .
        1 1 1 1 1 1 1 . . .
        . . . . . . . . . .
        `
            :
            img`
        0 0 0 6 6 6 6 6 0 0 0
        0 6 6 7 7 7 7 7 6 6 0
        0 6 7 7 1 1 1 7 7 6 0
        6 7 7 1 7 7 7 1 7 7 6
        6 7 7 1 7 7 7 1 7 7 6
        6 7 7 1 1 1 1 1 7 7 6
        6 6 7 1 7 7 7 1 7 6 6
        8 6 6 1 7 7 7 1 6 6 8
        8 6 6 7 6 6 6 7 6 6 8
        0 8 6 6 6 6 6 6 6 8 0
        0 0 8 8 8 8 8 8 8 0 0
        `
    }

    /**
     * Change the default dialog frame to a new image. Dialog frames
     * are divided into three rows and three columns and are used to define
     * the outer frame of the dialog box.
     *
     * @param frame A square image with a width and height divisible by three
     */
    //% blockId=game_dialog_set_frame group="Dialogs"
    //% block="set dialog frame to %frame=dialog_image_picker"
    //% help=game/set-dialog-frame
    export function setDialogFrame(frame: Image) {
        dialogFrame = frame;
    }

    /**
     * Change the default image used for the cursor that appears in the
     * bottom left of the dialog box.
     *
     * @param cursor The image to use for the cursor
     */
    //% blockId=game_dialog_set_cursor group="Dialogs"
    //% block="set dialog cursor to %frame=screen_image_picker"
    //% help=game/set-dialog-cursor
    export function setDialogCursor(cursor: Image) {
        dialogCursor = cursor;
    }

    /**
     * Change the color for the text in dialog boxes.
     *
     * @param color The index of the color 0-15
     */
    //% blockId=game_dialog_set_text_color group="Dialogs"
    //% block="set dialog text color to %color=colorindexpicker"
    //% help=game/set-dialog-text-color
    export function setDialogTextColor(color: number) {
        dialogTextColor = Math.floor(Math.min(15, Math.max(0, color)));
    }

    // this function is deprecated
    //% deprecated blockHidden
    export function setDialogFont(font: image.Font) {
    }

    /**
     * Show a title and an optional subtitle menu
     * @param title
     * @param subtitle
     */
    //% weight=90 help=game/splash
    //% blockId=gameSplash block="splash %title||%subtitle"
    //% group="Prompt"
    export function splash(title: string, subtitle?: string) {
        controller._setUserEventsEnabled(false);
        game.pushScene();
        game.currentScene().flags |= scene.Flag.SeeThrough;

        const dialog = new SplashDialog(screen.width, subtitle ? 42 : 35);
        dialog.setText(title);
        if (subtitle) dialog.setSubtext(subtitle);

        const s = sprites.create(dialog.image, -1);
        let pressed = true;
        let done = false;

        game.onUpdate(() => {
            dialog.update();
            const currentState = controller.A.isPressed();
            if (currentState && !pressed) {
                pressed = true;
                scene.setBackgroundImage(null); // GC it
                game.popScene();
                done = true;
            }
            else if (pressed && !currentState) {
                pressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
    }
}

