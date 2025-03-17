namespace game {

    /**
     * Ask the player for a number value.
     * @param message The message to display on the text-entry screen
     * @param answerLength The maximum number of digits the user can enter (1 - 10)
     * @param useOnScreenKeyboard Force the simulator to use the on-screen keyboard for text entry
     */
    //% weight=10 help=game/ask-for-number
    //% blockId=gameaskfornumber
    //% block="ask for number $message || and max length $answerLength use on-screen keyboard $useOnScreenKeyboard"
    //% message.shadow=text
    //% message.defl=""
    //% answerLength.defl="6"
    //% answerLength.min=1
    //% answerLength.max=10
    //% group="Prompt"
    export function askForNumber(message: any, answerLength = 6, useOnScreenKeyboard = false) {
        answerLength = Math.max(0, Math.min(10, answerLength));
        let p = new game.NumberPrompt();
        const result = p.show(console.inspect(message), answerLength, useOnScreenKeyboard);
        return parseFloat(result);
    }

    export class NumberPrompt extends Prompt {
        constructor(theme?: PromptTheme) {
            super(theme);

            this.keyboardColumns = 3;
            this.keyboardRows = 4;
        }

        protected numbersOnly() {
            return true;
        }

        protected drawBottomBar() {
            this.drawBottomBarBackground();

            this.drawConfirm(this.cursorRow === 4);
        }

        protected confirm() {
            if (this.cursorRow === 4) {
                this.confirmPressed = true;
            } else {
                if (this.selectionStart >= this.answerLength) return;

                const index = this.cursorColumn + this.cursorRow * this.keyboardColumns
                const letter = this.getSymbolForIndex(index);

                if (letter === ".") {
                    if (this.result.indexOf(".") !== -1) {
                        return;
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

                this.changeInputIndex(1);
            }
        }

        protected moveVertical(up: boolean): void {
            super.moveVertical(up);
            if (up && this.cursorRow === this.keyboardRows - 1) {
                this.cursorColumn = this.keyboardColumns - 1;
            }
        }

        protected getSymbolForIndex(index: number): string {
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
}