enum DialogLayout {
    Bottom,
    Left,
    Right,
    Top,
    Center,
    Full
}

namespace game {
    let dialogFrame: Image;
    let dialogCursor: Image;
    let dialogFont: image.Font;

    export class Dialog {
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

        chunks: string[];
        chunkIndex: number;

        constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
            this.image = image.create(width, height);

            this.frame = frame || dialogFrame || (dialogFrame =  img`
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
                `);

            this.font = font || dialogFont || (dialogFont = image.font8);

            this.cursor = cursor || dialogCursor || (dialogCursor = img`
                7 7 7 7 7 7 7 . . .
                7 7 7 1 7 7 7 7 . .
                7 7 1 7 1 7 7 7 7 .
                7 7 1 1 1 7 7 7 7 7
                7 7 1 7 1 7 7 7 7 6
                7 7 1 7 1 7 7 7 6 .
                7 7 7 7 7 7 7 6 . .
                . 6 6 6 6 6 6 . . .
                `);

            this.unit = Math.floor(this.frame.width / 3);
            this.columns = Math.floor(width / this.unit);
            this.rows = Math.floor(height / this.unit);

            this.innerLeft = (width - (this.columns * this.unit)) >> 1;
            this.innerTop = (height - (this.rows * this.unit)) >> 1;

            this.cursorCount = 0;
            this.chunkIndex = 0;

            this.drawBorder();
            this.clearInterior();
        }

        hasNext() {
            if (!this.chunks || this.chunks.length === 0) return false;
            return this.chunkIndex < this.chunks.length - 1;
        }

        nextPage() {
            if (this.hasNext()) {
                this.chunkIndex++;
            }
        }

        chunkText(str: string): string[] {
            const charactersPerRow = Math.floor(this.textAreaWidth() / this.font.charWidth);
            const rowsOfCharacters = Math.floor(this.textAreaHeight() / this.rowHeight());

            const screens: string[] = [];

            let strIndex = 0;
            let rowIndex = 0;
            let current = "";

            while (strIndex < str.length) {
                const lastIndex = strIndex + charactersPerRow - 1;

                if (str.charAt(lastIndex) === " " || lastIndex >= str.length - 1) {
                    current += str.substr(strIndex, charactersPerRow);
                    strIndex += charactersPerRow;
                }
                else if (str.charAt(lastIndex + 1) === " ") {
                    // No need to break, but consume the space
                    current += str.substr(strIndex, charactersPerRow);
                    strIndex += charactersPerRow + 1;
                }
                else if (str.charAt(lastIndex - 1) === " ") {
                    // Move the whole word down to the next row
                    current += str.substr(strIndex, charactersPerRow - 1) + " ";
                    strIndex += charactersPerRow - 1;
                }
                else if (str.charAt(lastIndex - 2) === " ") {
                    // Move the whole word down to the next row
                    current += str.substr(strIndex, charactersPerRow - 2) + "  ";
                    strIndex += charactersPerRow - 2;
                }
                else {
                    // Insert a break
                    current += str.substr(strIndex, charactersPerRow - 1) + "-";
                    strIndex += charactersPerRow - 1;
                }

                rowIndex++;
                if (rowIndex >= rowsOfCharacters) {
                    rowIndex = 0;
                    screens.push(current);
                    current = "";
                }
            }

            screens.push(current)

            return screens;
        }

        setText(rawString: string) {
            this.chunks = this.chunkText(rawString);
            this.chunkIndex = 0;
        }

        drawTextCore() {
            if (!this.chunks || this.chunks.length === 0) return;
            this.clearInterior();
            const str = this.chunks[this.chunkIndex];
            const availableWidth = this.textAreaWidth();
            const availableHeight = this.textAreaHeight();

            const charactersPerRow = Math.floor(availableWidth / this.font.charWidth);
            const rowsOfCharacters = Math.floor(availableHeight / this.rowHeight());

            const textLeft = 1 + this.innerLeft + this.unit + ((availableWidth - charactersPerRow * this.font.charWidth) >> 1);
            const textTop = 1 + this.innerTop + this.unit + ((availableHeight - rowsOfCharacters * this.rowHeight()) >> 1);

            let current = 0;
            for (let row = 0; row < rowsOfCharacters; row++) {
                this.image.print(
                    str.substr(current, charactersPerRow),
                    textLeft,
                    textTop + row * this.rowHeight(),
                    15, this.font
                )
                current += charactersPerRow;
            }

            this.drawCursorRow();
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
                this.innerTop + this.unit + this.textAreaHeight() + 1
            )
        }

        private drawBorder() {
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

        private clearInterior() {
            for (let d = 1; d < this.columns - 1; d++) {
                for (let s = 1; s < this.rows - 1; s++) {
                    this.drawPartial(4, d, s)
                }
            }
        }

        private drawPartial(index: number, colTo: number, rowTo: number) {
            const x0 = this.innerLeft + colTo * this.unit;
            const y0 = this.innerTop + rowTo * this.unit;

            const xf = (index % 3) * this.unit;
            const yf = Math.floor(index / 3) * this.unit;

            for (let e = 0; e < this.unit; e++) {
                for (let t = 0; t < this.unit; t++) {
                    this.image.setPixel(
                        x0 + e,
                        y0 + t,
                        this.frame.getPixel(xf + e, yf + t));
                }
            }
        }

        private cursorRowHeight() {
            return this.cursor.height + 1;
        }

        private rowHeight() {
            return this.font.charHeight + 1;
        }

        private textAreaWidth() {
            return this.image.width - ((this.innerLeft + this.unit) << 1) - 2;
        }

        private textAreaHeight() {
            return this.image.height - ((this.innerTop + this.unit) << 1) - 1 - this.cursorRowHeight();
        }
    }

    export function showLongText(str: string, layout: DialogLayout) {
        const temp = screen.clone();
        controller._setUserEventsEnabled(false);
        game.pushScene();
        scene.setBackgroundImage(temp);

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
        const s = sprites.create(dialog.image);
        s.top = top;
        s.left = left;

        dialog.setText(str)
        let pressed = true;
        let done = false;

        game.onUpdate(() => {
            dialog.drawTextCore();
            const currentState = controller.A.isPressed();
            if (currentState && !pressed) {
                pressed = true;
                if (dialog.hasNext()) {
                    dialog.nextPage();
                }
                else {
                    game.popScene();
                    done = true;
                }
            }
            else if (pressed && !currentState) {
                pressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
    }

    export function setDialogFrame(frame: Image) {
        dialogFrame = frame;
    }

    export function setDialogFont(font: image.Font) {
        dialogFont = font;
    }

    export function setDialogCursor(cursor: Image) {
        dialogCursor = cursor;
    }
}

