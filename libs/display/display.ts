/**
 * Basic screen display functionalities
 */
//% weight=98 icon="\uf108" color="#311557"
//% groups='["Screen", "Charts"]'
namespace display {
    const textOffset = 4;
    const lineOffset = 2;

    /**
     * Gets the text line height
     */
    export function lineHeight(): number {
        return image.font8.charHeight + lineOffset;
    }

    /**
     * Number of lines
     */
    export function lineCount(): number {
        return ((screen.height - textOffset) / lineHeight()) >> 0
    }

    /**
     * Show text on the screen at a specific line.
     * @param text the text to print on the screen, eg: "Hello world"
     * @param line the line number to print the text at (starting at 1), eg: 1
     */
    //% blockId=displayshowstring block="show string %text|at line %line"
    //% weight=98 inlineInputMode="inline" blockGap=8
    //% help=display/show-string
    export function showString(text: string, line: number) {
        // line indexing starts at 1.
        line = (line - 1) >> 0;
        const nlines = lineCount();
        if (line < 0 || line >= nlines) return; // out of screen

        const h = lineHeight();
        const y = textOffset + h * line;
        screen.fillRect(0, y, screen.width, h, 0); // clear background
        screen.print(text, textOffset, y);
    }

    /**
     * Shows a number on the screen
     * @param value the numeric value
     * @param line the line number to print the text at (starting at 1), eg: 1
     */
    //% blockId=displayshownumber block="show number %name|at line %line"
    //% weight=96 inlineInputMode="inline" blockGap=8
    //% help=display/show-number
    //% line.min=1 line.max=10
    export function showNumber(value: number, line: number) {
        showString("" + value, line);
    }

    /**
     * Shows a name, value pair on the screen
     * @param value the numeric value
     * @param line the line number to print the text at (starting at 1), eg: 1
     */
    //% blockId=displayshowvalue block="show value %name|: %text|at line %line"
    //% weight=96 inlineInputMode="inline" blockGap=8
    //% help=display/show-value
    //% line.min=1 line.max=10
    export function showValue(name: string, value: number, line: number) {
        value = Math.round(value * 1000) / 1000;
        showString((name ? name + ": " : "") + value, line);
    }

    /**
     * Clear the screen
     */
    //% blockId=displayclear block="clear display"
    //% weight=90
    //% help=display/clear
    export function clear() {
        screen.fill(0)
    }

    /**
     * Sends the log messages to the brick screen and uses the brick up and down buttons to scroll.
     */
    //% blockId=displayshowconsole block="show console"
    //% weight=1
    //% help=display/show-console
    export function showConsole(): void {
        display.text.scroll(0);
    }
}

namespace display.text {
    export let maxLines = 200;
    let screenLines = 1;
    let lines: string[];
    let scrollPosition = 0;

    function init() {
        if (!lines) {
            lines = [];
            console.addListener(log);
            screenLines = display.lineCount();
        }
    }

    function printLog() {
        display.clear();
        if (!lines) return;
        screenLines = display.lineCount();
        const h = display.lineHeight();
        for (let i = 0; i < screenLines; ++i) {
            const line = lines[i + scrollPosition];
            if (line)
                display.showString(line, i + 1);
        }
    }

    export function scroll(pos: number) {
        init();
        if (!pos) return;

        scrollPosition += pos >> 0;
        if (scrollPosition >= lines.length) scrollPosition = lines.length - 1;
        if (scrollPosition < 0) scrollPosition = 0;
        printLog();
    }

    function log(msg: string): void {
        lines.push(msg);
        if (lines.length + 5 > maxLines) {
            lines.splice(0, lines.length >> 1);
            scrollPosition = Math.min(scrollPosition, lines.length - 1)
        }
        // move down scroll once it gets large than the screen
        if (lines.length > screenLines
            && lines.length >= scrollPosition + screenLines) {
            scrollPosition++;
        }
        printLog();
    }
}    
