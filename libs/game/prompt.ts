namespace game {
    export const _KEYBOARD_CHANGE_EVENT = 7339;
    export const _KEYBOARD_ENTER_EVENT = 7340;
    export const _KEYBOARD_CANCEL_EVENT = 7341;

    export interface PromptTheme {
        colorPrompt: number;
        colorInput: number;
        colorInputHighlighted: number;
        colorInputText: number;
        colorAlphabet: number;
        colorCursor: number;
        colorBackground: number;
        colorBottomBackground: number;
        colorBottomText: number;
    }

    /**
     * Ask the player for a string value.
     * @param message The message to display on the text-entry screen
     * @param answerLength The maximum number of characters the user can enter (1 - 24)
     * @param useOnScreenKeyboard Force the simulator to use the on-screen keyboard for text entry
     */
    //% weight=10 help=game/ask-for-string
    //% blockId=gameaskforstring
    //% block="ask for string $message || and max length $answerLength use on-screen keyboard $useOnScreenKeyboard"
    //% message.shadow=text
    //% message.defl=""
    //% answerLength.defl="12"
    //% answerLength.min=1
    //% answerLength.max=24
    //% group="Prompt"
    export function askForString(message: any, answerLength = 12, useOnScreenKeyboard = false) {
        let p = new game.Prompt();
        const result = p.show(console.inspect(message), answerLength, useOnScreenKeyboard);
        return result;
    }


    //% whenUsed=true
    const font = image.font8; // FONT8-TODO
    //% whenUsed=true
    const PADDING = 4;

    //% whenUsed=true
    const NUM_LETTERS = 26;
    //% whenUsed=true
    const ALPHABET_ROW_LENGTH = 12;
    //% whenUsed=true
    const NUM_ROWS = Math.ceil(NUM_LETTERS / ALPHABET_ROW_LENGTH);
    //% whenUsed=true
    const INPUT_ROWS = 2;

    //% whenUsed=true
    const CONTENT_WIDTH = screen.width - PADDING * 2;
    //% whenUsed=true
    const CONTENT_HEIGHT = screen.height - PADDING * 2;
    //% whenUsed=true
    const CONTENT_TOP = PADDING;

    // Dimensions of a "cell" that contains a letter
    //% whenUsed=true
    const CELL_WIDTH = Math.floor(CONTENT_WIDTH / ALPHABET_ROW_LENGTH);
    //% whenUsed=true
    const CELL_HEIGHT = CELL_WIDTH;
    //% whenUsed=true
    const LETTER_OFFSET_X = Math.floor((CELL_WIDTH - font.charWidth) / 2);
    //% whenUsed=true
    const LETTER_OFFSET_Y = Math.floor((CELL_HEIGHT - font.charHeight) / 2);
    //% whenUsed=true
    const BLANK_PADDING = 1;
    //% whenUsed=true
    const ROW_LEFT = PADDING + Math.floor((CONTENT_WIDTH - (CELL_WIDTH * ALPHABET_ROW_LENGTH)) / 2);

    // Dimensions of the bottom bar
    //% whenUsed=true
    const BOTTOM_BAR_ALPHABET_MARGIN = 4;
    //% whenUsed=true
    const BOTTOM_BAR_HEIGHT = PADDING + BOTTOM_BAR_ALPHABET_MARGIN + CELL_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_BUTTON_WIDTH = PADDING * 2 + font.charWidth * 3;
    //% whenUsed=true
    const BOTTOM_BAR_TEXT_Y = (BOTTOM_BAR_HEIGHT - font.charHeight) / 2;
    //% whenUsed=true
    const BOTTOM_BAR_SHIFT_X = (BOTTOM_BAR_BUTTON_WIDTH - font.charWidth * 3) / 2;
    //% whenUsed=true
    const BOTTOM_BAR_CONFIRM_X = (BOTTOM_BAR_BUTTON_WIDTH - font.charWidth * 2) / 2;
    //% whenUsed=true
    const CONFIRM_BUTTON_LEFT = screen.width - BOTTOM_BAR_BUTTON_WIDTH;

    // Dimensions of the alphabet area
    //% whenUsed=true
    const ALPHABET_HEIGHT = NUM_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const ALPHABET_TOP = CONTENT_TOP + CONTENT_HEIGHT - ALPHABET_HEIGHT - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const ALPHABET_INPUT_MARGIN = 10;

    // Dimensions of area where text is input
    //% whenUsed=true
    const INPUT_HEIGHT = INPUT_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const INPUT_TOP = ALPHABET_TOP - INPUT_HEIGHT - ALPHABET_INPUT_MARGIN;

    //% whenUsed=true
    const lowerShiftText = "ABC";
    //% whenUsed=true
    const upperShiftText = "abc";
    //% whenUsed=true
    const digitsUpper = [" ", ",", ".", "?", "!", ":", ";", "\"", "(", ")"];
    //% whenUsed=true
    const confirmText = "OK";


    export class Prompt {
        theme: PromptTheme;

        message: string;
        answerLength: number;
        result: string;

        protected confirmPressed: boolean;
        protected cursorRow: number;
        protected cursorColumn: number;
        protected upper: boolean;
        protected useSystemKeyboard: boolean;

        protected renderable: scene.Renderable;
        protected selectionStart: number;
        protected selectionEnd: number;

        protected keyboardRows: number;
        protected keyboardColumns: number;

        private changeTime = 0;

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
            this.upper = false;
            this.result = "";
            this.keyboardColumns = ALPHABET_ROW_LENGTH;
            this.keyboardRows = NUM_ROWS;
            this.selectionStart = 0;
            this.selectionEnd = 0;
        }

        show(message: string, answerLength: number, useOnScreenKeyboard = false) {
            this.message = message;
            this.answerLength = answerLength;

            controller._setUserEventsEnabled(false);
            game.pushScene()

            this.createRenderable();
            this.confirmPressed = false;

            if (!useOnScreenKeyboard && control.deviceDalVersion() === "sim" && helpers._isSystemKeyboardSupported()) {
                this.useSystemKeyboard = true;
                helpers._promptForText(this.answerLength, this.numbersOnly());
                this.selectionEnd = 0;
                this.selectionStart = 0;
                control.onEvent(_KEYBOARD_CHANGE_EVENT, 0, () => {
                    this.result = helpers._getTextPromptString().substr(0, this.answerLength);

                    this.changeTime = game.runtime();

                    this.selectionStart = helpers._getTextPromptSelectionStart();
                    this.selectionEnd = helpers._getTextPromptSelectionEnd();
                })

                let cancelled = false;
                let finished = false;

                control.onEvent(_KEYBOARD_CANCEL_EVENT, 0, () => {
                    cancelled = true;
                });

                control.onEvent(_KEYBOARD_ENTER_EVENT, 0, () => {
                    finished = true;
                });

                pauseUntil(() => cancelled || finished);

                if (cancelled) {
                    this.useSystemKeyboard = false;
                    this.selectionStart = this.result.length;
                    this.selectionEnd = this.selectionStart;
                    this.registerHandlers();
                    pauseUntil(() => this.confirmPressed);
                }
            }
            else {
                this.useSystemKeyboard = false;
                this.registerHandlers();
                pauseUntil(() => this.confirmPressed);
            }

            game.popScene();
            controller._setUserEventsEnabled(true);

            return this.result;
        }

        protected numbersOnly() {
            return false;
        }

        protected createRenderable() {
            if (this.renderable) {
                this.renderable.destroy();
            }

            const promptText = new sprites.RenderText(this.message, CONTENT_WIDTH);
            let systemKeyboardText: sprites.RenderText;

            this.renderable = scene.createRenderable(-1, () => {
                promptText.draw(screen, (screen.width >> 1) - (promptText.width >> 1), CONTENT_TOP, this.theme.colorPrompt, 0, 2)
                this.drawInputArea();

                if (!this.useSystemKeyboard) {
                    this.drawKeyboard();
                    this.drawBottomBar();
                    return;
                }

                if (!systemKeyboardText) {
                    systemKeyboardText = new sprites.RenderText(helpers._getLocalizedInstructions(), CONTENT_WIDTH);
                }

                screen.fillRect(0, screen.height - (PADDING << 1) - systemKeyboardText.height, screen.width, screen.height, this.theme.colorBottomBackground);
                systemKeyboardText.draw(screen, PADDING, screen.height - PADDING - systemKeyboardText.height, this.theme.colorBottomText);
            });
        }

        protected drawInputArea() {
            const answerLeft = ROW_LEFT + Math.floor(
                ((CELL_WIDTH * ALPHABET_ROW_LENGTH) -
                    CELL_WIDTH * Math.min(this.answerLength, ALPHABET_ROW_LENGTH)) / 2);

            for (let i = 0; i < this.answerLength; i++) {
                const col = i % ALPHABET_ROW_LENGTH;
                const row = Math.floor(i / ALPHABET_ROW_LENGTH);

                if (this.selectionStart !== this.selectionEnd && i >= this.selectionStart && i < this.selectionEnd) {
                    screen.fillRect(
                        answerLeft + col * CELL_WIDTH,
                        INPUT_TOP + row * CELL_HEIGHT,
                        CELL_WIDTH,
                        CELL_HEIGHT,
                        this.theme.colorCursor
                    );
                }

                screen.fillRect(
                    answerLeft + col * CELL_WIDTH + BLANK_PADDING,
                    INPUT_TOP + row * CELL_HEIGHT + CELL_HEIGHT - 1,
                    CELL_WIDTH - BLANK_PADDING * 2,
                    1,
                    !this.useSystemKeyboard && !this.blink() && i === this.selectionStart ? this.theme.colorInputHighlighted : this.theme.colorInput
                );

                if (i < this.result.length) {
                    const char = this.result.charAt(i);
                    screen.print(
                        char,
                        answerLeft + col * CELL_WIDTH + LETTER_OFFSET_X,
                        INPUT_TOP + row * CELL_HEIGHT + LETTER_OFFSET_Y,
                        this.theme.colorInputText,
                        font
                    );
                }
            }

            // draw the blinking text cursor
            if (this.useSystemKeyboard) {
                if (this.selectionStart === this.selectionEnd && this.selectionStart < this.answerLength) {
                    const col = this.selectionStart % ALPHABET_ROW_LENGTH;
                    const row = Math.floor(this.selectionStart / ALPHABET_ROW_LENGTH);
                    if (!this.blink()) {
                        screen.fillRect(
                            answerLeft + col * CELL_WIDTH,
                            INPUT_TOP + row * CELL_HEIGHT,
                            1,
                            CELL_HEIGHT,
                            this.theme.colorCursor
                        );
                    }
                }
            }
        }

        protected drawKeyboard() {
            const top = screen.height - BOTTOM_BAR_HEIGHT - this.keyboardRows * CELL_HEIGHT - PADDING;
            const left = (screen.width >> 1) - ((CELL_WIDTH * this.keyboardColumns) >> 1)
            for (let j = 0; j < this.keyboardRows * this.keyboardColumns; j++) {
                const col = j % this.keyboardColumns;
                const row = Math.idiv(j, this.keyboardColumns);

                if (col === this.cursorColumn && row === this.cursorRow) {
                    screen.fillRect(
                        left + col * CELL_WIDTH,
                        top + row * CELL_HEIGHT,
                        CELL_WIDTH,
                        CELL_HEIGHT,
                        this.theme.colorCursor
                    )
                }

                screen.print(
                    this.getSymbolForIndex(j),
                    left + col * CELL_WIDTH + LETTER_OFFSET_X,
                    top + row * CELL_HEIGHT + LETTER_OFFSET_Y,
                    this.theme.colorAlphabet
                )
            }
        }

        protected drawBottomBar() {
            this.drawBottomBarBackground();
            this.drawShift(this.cursorRow === 3 && !(this.cursorColumn & 1));
            this.drawConfirm(this.cursorRow === 3 && !!(this.cursorColumn & 1));
        }

        protected drawBottomBarBackground() {
            screen.fillRect(0, screen.height - BOTTOM_BAR_HEIGHT, screen.width, BOTTOM_BAR_HEIGHT, this.theme.colorBottomBackground);
        }

        protected drawShift(highlighted: boolean) {
            if (highlighted) {
                screen.fillRect(
                    0,
                    screen.height - BOTTOM_BAR_HEIGHT,
                    BOTTOM_BAR_BUTTON_WIDTH,
                    BOTTOM_BAR_HEIGHT,
                    this.theme.colorCursor
                );
            }

            let shiftText = lowerShiftText;
            if (this.upper) {
                shiftText = upperShiftText;
            }
            screen.print(
                shiftText,
                BOTTOM_BAR_SHIFT_X,
                screen.height - BOTTOM_BAR_HEIGHT + BOTTOM_BAR_TEXT_Y,
                this.theme.colorBottomText
            )
        }

        protected drawConfirm(highlighted: boolean) {
            if (highlighted) {
                screen.fillRect(
                    CONFIRM_BUTTON_LEFT,
                    screen.height - BOTTOM_BAR_HEIGHT,
                    BOTTOM_BAR_BUTTON_WIDTH,
                    BOTTOM_BAR_HEIGHT,
                    this.theme.colorCursor
                );
            }

            screen.print(
                confirmText,
                CONFIRM_BUTTON_LEFT + BOTTOM_BAR_CONFIRM_X,
                screen.height - BOTTOM_BAR_HEIGHT + BOTTOM_BAR_TEXT_Y,
                this.theme.colorBottomText
            )
        }

        protected getSymbolForIndex(index: number) {
            return getCharForIndex(index, this.upper);
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
        }

        protected moveVertical(up: boolean) {
            if (up) {
                if (this.cursorRow === this.keyboardRows) {
                    this.cursorRow = this.keyboardRows - 1;

                    if (this.cursorColumn % 2) {
                        this.cursorColumn = this.keyboardColumns - 1;
                    }
                    else {
                        this.cursorColumn = 0;
                    }
                }
                else {
                    this.cursorRow = Math.max(0, this.cursorRow - 1);
                }
            }
            else {
                this.cursorRow = Math.min(this.keyboardRows, this.cursorRow + 1);

                if (this.cursorRow === this.keyboardRows) {
                    // Go to closest button
                    this.cursorColumn = this.cursorColumn > 5 ? 1 : 0;
                }
            }
        }

        protected moveHorizontal(right: boolean) {
            if (right) {
                this.cursorColumn = (this.cursorColumn + 1) % this.keyboardColumns;
            }
            else {
                this.cursorColumn = (this.cursorColumn + (this.keyboardColumns - 1)) % this.keyboardColumns;
            }
        }

        protected confirm() {
            if (this.cursorRow === 3) {
                if (this.cursorColumn % 2) {
                    this.confirmPressed = true;
                }
                else {
                    this.upper = !this.upper;
                }
            }
            else {
                if (this.selectionStart >= this.answerLength) return;

                const index = this.cursorColumn + this.cursorRow * this.keyboardColumns
                const letter = getCharForIndex(index, this.upper);

                if (!this.result) {
                    this.result = letter;
                }
                else {
                    this.result += letter;
                }

                this.changeTime = game.runtime();

                this.changeInputIndex(1);
            }
        }

        protected delete() {
            if (this.selectionStart <= 0) return;

            this.result = this.result.substr(0, this.result.length - 1);
            this.changeInputIndex(-1);
        }

        protected changeInputIndex(delta: number) {
            this.selectionStart += delta;
            this.selectionEnd = this.selectionStart;
        }

        protected blink() {
            return Math.idiv(game.runtime() - this.changeTime, 500) & 1;
        }
    }

    function getCharForIndex(index: number, upper: boolean) {
        if (index < 26) {
            return String.fromCharCode(index + (upper ? 65 : 97));
        }
        else {
            if (upper) {
                return digitsUpper[index - 26];
            }
            else {
                return "" + (index - 26);
            }
        }
    }
}