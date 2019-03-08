namespace game {

    /**
     * Ask the player for a number value.
     * @param message The message to display on the text-entry screen
     * @param answerLength The maximum number of digits the user can enter (1 - 10)
     */
    //% group="Gameplay"
    //% weight=10 help=game/ask-for-string
    //% blockId=gameaskfornumber block="ask for number with text %message || and max length %answerLength"
    //% message.defl=""
    //% answerLength.defl="6"
    //% answerLength.min=1
    //% answerLength.max=10
    //% group="Prompt"
    export function askForNumber(message: string, answerLength = 6) {
        answerLength = Math.max(0, Math.min(10, answerLength));
        let p = new game.NumberPrompt();
        const result = p.show(message, answerLength);
        return result;
    }


    //% whenUsed=true
    const font = image.font8;
    //% whenUsed=true
    const PADDING_HORIZONTAL = 40;
    //% whenUsed=true
    const PADDING_VERTICAL = 4;
    //% whenUsed=true
    const PROMPT_LINE_SPACING = 2;

    //% whenUsed=true
    const NUM_LETTERS = 12;
    //% whenUsed=true
    const NUMPAD_ROW_LENGTH = 3;
    //% whenUsed=true
    const NUM_ROWS = Math.ceil(NUM_LETTERS / NUMPAD_ROW_LENGTH);
    //% whenUsed=true
    const INPUT_ROWS = 1;

    //% whenUsed=true
    const CONTENT_WIDTH = screen.width - PADDING_HORIZONTAL * 2;
    //% whenUsed=true
    const CONTENT_HEIGHT = screen.height - PADDING_VERTICAL * 2;
    //% whenUsed=true
    const CONTENT_TOP = PADDING_VERTICAL;

    // Dimensions of a "cell" that contains a letter
    //% whenUsed=true
    const CELL_HEIGHT = Math.floor(CONTENT_HEIGHT / (NUM_ROWS + 4));
    //% whenUsed=true
    const CELL_WIDTH = CELL_HEIGHT//Math.floor(CONTENT_WIDTH / NUMPAD_ROW_LENGTH);
    //% whenUsed=true
    const LETTER_OFFSET_X = Math.floor((CELL_WIDTH - font.charWidth) / 2);
    //% whenUsed=true
    const LETTER_OFFSET_Y = Math.floor((CELL_HEIGHT - font.charHeight) / 2);
    //% whenUsed=true
    const BLANK_PADDING = 1;
    //% whenUsed=true
    const ROW_LEFT = PADDING_HORIZONTAL + CELL_WIDTH / 2 + Math.floor((CONTENT_WIDTH - (CELL_WIDTH * NUMPAD_ROW_LENGTH)) / 2);

    // Dimensions of the bottom bar
    //% whenUsed=true
    const BOTTOM_BAR_NUMPAD_MARGIN = 4;
    //% whenUsed=true
    const BOTTOM_BAR_HEIGHT = PADDING_VERTICAL + BOTTOM_BAR_NUMPAD_MARGIN + CELL_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_TOP = screen.height - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_BUTTON_WIDTH = PADDING_HORIZONTAL * 2 + font.charWidth * 3;
    //% whenUsed=true
    const BOTTOM_BAR_TEXT_Y = (BOTTOM_BAR_HEIGHT - font.charHeight) / 2;
    //% whenUsed=true
    const BOTTOM_BAR_CONFIRM_X = (BOTTOM_BAR_BUTTON_WIDTH - font.charWidth * 2) / 2;

    // Dimensions of the numpad area
    //% whenUsed=true
    const NUMPAD_HEIGHT = NUM_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const NUMPAD_TOP = screen.height - NUMPAD_HEIGHT - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const NUMPAD_INPUT_MARGIN = 4;

    // Dimensions of area where text is input
    //% whenUsed=true
    const INPUT_HEIGHT = INPUT_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const INPUT_TOP = NUMPAD_TOP - INPUT_HEIGHT - NUMPAD_INPUT_MARGIN;

    // Dimensions of prompt message area
    //% whenUsed=true
    const PROMPT_HEIGHT = INPUT_TOP - CONTENT_TOP;

    //% whenUsed=true
    const confirmText = "OK";


    export class NumberPrompt {
        theme: PromptTheme;

        message: string;
        answerLength: number;
        result: string;

        private cursor: Sprite;
        private confirmButton: Sprite;

        private numbers: Sprite[];
        private inputs: Sprite[];

        private confirmPressed: boolean;
        private cursorRow: number;
        private cursorColumn: number;
        private hasDecimal: boolean;
        private inputIndex: number;
        private blink: boolean;
        private frameCount: number;

        constructor(theme?: PromptTheme) {
            if (theme) {
                this.theme = theme;
            }
            else {
                this.theme = {
                    colorPrompt: 1,
                    colorInput: 3,
                    colorInputHighlighted: 5,
                    colorInputText: 1,
                    colorAlphabet: 1,
                    colorCursor: 7,
                    colorBackground: 15,
                    colorBottomBackground: 3,
                    colorBottomText: 1,
                };
            }
            this.cursorRow = 0;
            this.cursorColumn = 0;
            this.hasDecimal = false;
            this.inputIndex = 0;
        }

        show(message: string, answerLength: number) : number {
            this.message = message;
            this.answerLength = answerLength;
            this.inputIndex = 0;

            controller._setUserEventsEnabled(false);
            game.pushScene()

            this.draw();
            this.registerHandlers();
            this.confirmPressed = false;

            pauseUntil(() => this.confirmPressed);

            game.popScene();
            controller._setUserEventsEnabled(true);

            return parseFloat(this.result);
        }

        private draw() {
            this.drawPromptText();
            this.drawNumpad();
            this.drawInputarea();
            this.drawBottomBar();
        }

        private drawPromptText() {
            const prompt = sprites.create(layoutText(this.message, CONTENT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.x = screen.width / 2
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2);
        }

        private drawInputarea() {
            const answerLeft = (screen.width - this.answerLength * CELL_WIDTH) / 2

            this.inputs = [];
            for (let i = 0; i < this.answerLength; i++) {
                const blank = image.create(CELL_WIDTH, CELL_HEIGHT);
                this.drawInput(blank, "", this.theme.colorInput);

                const s = sprites.create(blank, -1);
                s.left = answerLeft + i * CELL_WIDTH;
                s.y = INPUT_TOP;
                this.inputs.push(s);
            }
        }

        private drawNumpad() {
            const cursorImage = image.create(CELL_WIDTH, CELL_HEIGHT);
            cursorImage.fill(this.theme.colorCursor);
            this.cursor = sprites.create(cursorImage, -1);
            this.cursor.z = -1;
            this.updateCursor();

            this.numbers = [];
            for (let j = 0; j < NUM_LETTERS; j++) {
                const letter = image.create(CELL_WIDTH, CELL_HEIGHT);

                const col2 = j % NUMPAD_ROW_LENGTH;
                const row2 = Math.floor(j / NUMPAD_ROW_LENGTH);

                const t = sprites.create(letter, -1);
                t.x = ROW_LEFT + col2 * CELL_WIDTH;
                t.y = NUMPAD_TOP + row2 * CELL_HEIGHT;

                this.numbers.push(t);
            }
            this.updateKeyboard();
        }

        private drawBottomBar() {
            const bg = image.create(screen.width, BOTTOM_BAR_HEIGHT);
            bg.fill(this.theme.colorBottomBackground);

            const bgSprite = sprites.create(bg, -1);
            bgSprite.x = screen.width / 2;
            bgSprite.y = BOTTOM_BAR_TOP + BOTTOM_BAR_HEIGHT / 2;
            bgSprite.z = -1;

            this.confirmButton = sprites.create(image.create(BOTTOM_BAR_BUTTON_WIDTH, BOTTOM_BAR_HEIGHT), -1);
            this.confirmButton.right = screen.width;
            this.confirmButton.y = BOTTOM_BAR_TOP + Math.ceil(BOTTOM_BAR_HEIGHT / 2);

            this.updateButtons();
        }

        private updateButtons() {
            if (this.cursorRow === 4) {
                this.confirmButton.image.fill(this.theme.colorCursor);
            }
            else {
                this.confirmButton.image.fill(this.theme.colorBottomBackground);
            }

            this.confirmButton.image.print(confirmText, BOTTOM_BAR_CONFIRM_X, BOTTOM_BAR_TEXT_Y);
        }

        private updateCursor() {
            if (this.cursorRow === 4) {
                this.cursor.image.fill(0);
                this.updateButtons();
            }
            else {
                this.cursor.x = ROW_LEFT + this.cursorColumn * CELL_WIDTH;
                this.cursor.y = NUMPAD_TOP + this.cursorRow * CELL_HEIGHT;
            }
        }

        private updateSelectedInput() {
            if (this.inputIndex < this.answerLength) {
                const u = this.inputs[this.inputIndex];
                if (this.blink) {
                    this.drawInput(u.image, "", this.theme.colorInput);
                }
                else {
                    this.drawInput(u.image, "", this.theme.colorInputHighlighted)
                }
            }
        }

        private updateKeyboard() {
            const len = this.numbers.length;
            for (let k = 0; k < len; k++) {
                const img = this.numbers[k].image;
                img.fill(0);
                img.print(getSymbolFromIndex(k), LETTER_OFFSET_X, LETTER_OFFSET_Y);
            }
        }

        private drawInput(img: Image, char: string, color: number) {
            img.fill(0);
            img.fillRect(BLANK_PADDING, CELL_HEIGHT - 1, CELL_WIDTH - BLANK_PADDING * 2, 1, color)

            if (char) {
                img.print(char, LETTER_OFFSET_X, LETTER_OFFSET_Y, this.theme.colorInputText, font);
            }
        }

        private registerHandlers() {
            controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(true);
            })

            controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(false);
            })

            controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveHorizontal(true);
            });

            controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveHorizontal(false);
            });

            controller.A.onEvent(SYSTEM_KEY_DOWN, () => {
                this.confirm();
            });

            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                this.delete();
            });


            this.frameCount = 0;
            this.blink = true;

            game.onUpdate(() => {
                this.frameCount = (this.frameCount + 1) % 30;

                if (this.frameCount === 0) {
                    this.blink = !this.blink;

                    this.updateSelectedInput();
                }
            })
        }

        private moveVertical(up: boolean) {
            if (up) {
                if (this.cursorRow === 4) {
                    this.cursor.image.fill(this.theme.colorCursor);
                    this.cursorRow = 3;

                    this.updateButtons();
                }
                else {
                    this.cursorRow = Math.max(0, this.cursorRow - 1);
                }
            }
            else {
                this.cursorRow = Math.min(4, this.cursorRow + 1);
            }

            this.updateCursor();
        }

        private moveHorizontal(right: boolean) {
            if (right) {
                this.cursorColumn = (this.cursorColumn + 1) % NUMPAD_ROW_LENGTH;
            }
            else {
                this.cursorColumn = (this.cursorColumn + (NUMPAD_ROW_LENGTH - 1)) % NUMPAD_ROW_LENGTH;
            }

            this.updateCursor();
        }

        private confirm() {
            if (this.cursorRow === 4) {
                this.confirmPressed = true;
            } else {
                if (this.inputIndex >= this.answerLength) return;

                const index = this.cursorColumn + this.cursorRow * NUMPAD_ROW_LENGTH
                const letter = getSymbolFromIndex(index);

                if (letter === ".") {
                    if(this.hasDecimal) {
                        return;
                    } else {
                        this.hasDecimal = true;
                    }
                }

                if (letter === "-" && (this.result && this.result.length > 0)) {
                    return;
                }

                if (!this.result) {
                    this.result = letter;
                }
                else {
                    this.result += letter;
                }

                const sprite = this.inputs[this.inputIndex];
                this.changeInputIndex(1);
                this.drawInput(sprite.image, letter, this.theme.colorInput);
            }
        }

        private delete() {
            if (this.inputIndex <= 0) return;

            if (this.inputIndex < this.answerLength) {
                this.drawInput(this.inputs[this.inputIndex].image, "", this.theme.colorInput);
            }

            if (this.result.charAt(this.result.length - 1) === ".") {
                this.hasDecimal = false;
            }

            this.result = this.result.substr(0, this.result.length - 1);

            this.changeInputIndex(-1);
        }

        private changeInputIndex(delta: number) {
            this.inputIndex += delta;
            this.frameCount = 0
            this.blink = false;
            this.updateSelectedInput();
        }
    }

    function layoutText(message: string, width: number, height: number, color: number) {
        const lineHeight = font.charHeight + PROMPT_LINE_SPACING;

        const lineLength = Math.floor(width / font.charWidth);
        const numLines = Math.floor(height / lineHeight);

        let lines: string[] = [];
        let word: string;
        let line: string;

        let pushWord = () => {
            if (line) {
                if (line.length + word.length + 1 > lineLength) {
                    lines.push(line);
                    line = word;
                }
                else {
                    line = line + " " + word;
                }
            }
            else {
                line = word;
            }

            word = null;
        }

        for (let l = 0; l < message.length; l++) {
            const char = message.charAt(l);

            if (char === " ") {
                if (word) {
                    pushWord();
                }
                else {
                    word = " ";
                }
            }
            else if (!word) {
                word = char;
            }
            else {
                word += char;
            }
        }

        if (word) {
            pushWord();
        }

        if (line) {
            lines.push(line);
        }

        let maxLineWidth = 0;
        for (let m = 0; m < lines.length; m++) {
            maxLineWidth = Math.max(maxLineWidth, lines[m].length);
        }

        const actualWidth = maxLineWidth * font.charWidth;
        const actualHeight = lines.length * lineHeight;

        const res = image.create(actualWidth, actualHeight);

        for (let n = 0; n < lines.length; n++) {
            if ((n + 1) > numLines) break;
            res.print(lines[n], 0, n * lineHeight, color, font);
        }

        return res;
    }

    function getSymbolFromIndex(index: number) {
        if (index < 9) {
            // Calculator Layout
            return "" + (3 * Math.idiv(9 - index - 1, 3) + index % 3 + 1);
        } else if (index == 9) {
            return "-";
        } else if (index == 10) {
            return "0";
        } else if (index == 11) {
            return ".";
        } else {
            return "";
        }
    }

}