namespace sprites {
    export class RenderText {
        linebreaks: number[];
        font: image.Font;
        height: number;
        width: number;

        constructor(public text: string, maxWidth: number) {
            this.font = image.getFontForText(text);

            this.setMaxWidth(maxWidth);
        }

        draw(canvas: Image, left: number, top: number, color: number, lineStart?: number, lineEnd?: number) {
            if (lineStart === undefined) lineStart = 0;
            if (lineEnd === undefined) lineEnd = this.linebreaks.length + 1;

            for (let i = lineStart; i < lineEnd; i++) {
                this.drawLine(canvas, left, top, i, color);
                top += this.font.charHeight;
            }
        }

        drawLine(canvas: Image, left: number, top: number, lineIndex: number, color: number) {
            const start = this.lineStart(lineIndex);
            const end = this.lineEnd(lineIndex);

            for (let i = start; i < end; i++) {
                canvas.print(this.text.charAt(i), left, top, color, this.font);
                left += this.font.charWidth;
            }
        }

        drawPartial(canvas: Image, left: number, top: number, color: number, lengthToDraw: number, lineStart?: number, lineEnd?: number) {
            if (lineStart === undefined) lineStart = 0;
            if (lineEnd === undefined) lineEnd = this.linebreaks.length + 1;

            let currentTextIndex = 0;
            for (let i = lineStart; i < lineEnd; i++) {
                currentTextIndex = this.drawPartialLine(canvas, left, top, i, color, currentTextIndex, lengthToDraw);
                top += this.font.charHeight;
                if (currentTextIndex >= lengthToDraw) return false;
            }

            return true;
        }

        drawPartialLine(canvas: Image, left: number, top: number, lineIndex: number, color: number, currentTextIndex: number, lengthToDraw: number) {
            const start = this.lineStart(lineIndex);
            const end = this.lineEnd(lineIndex);

            for (let i = start; i < end; i++) {
                canvas.print(this.text.charAt(i), left, top, color, this.font);
                left += this.font.charWidth;

                if (currentTextIndex + (i - start) >= lengthToDraw) {
                    return lengthToDraw;
                }
            }
            return currentTextIndex + end - start;
        }

        calculatePartialHeight(startLine: number, lengthToDraw: number) {
            if (this.linebreaks.length === 0) return this.font.charHeight;

            let current = 0;

            for (let i = startLine; i < this.linebreaks.length + 1; i++) {
                current += this.lineEnd(i) - this.lineStart(i);
                if (current > lengthToDraw) return (i - startLine + 1) * this.font.charHeight
            }
            return this.height;
        }

        lineHeight() {
            return this.font.charHeight;
        }

        setMaxWidth(maxWidth: number) {
            this.linebreaks = getLineBreaks(this.text, [Math.idiv(maxWidth, this.font.charWidth)]);
            this.height = (this.linebreaks.length + 1) * this.font.charHeight;

            this.width = 0;
            for (let i = 0; i < this.linebreaks.length + 1; i++) {
                this.width = Math.max(this.lineEnd(i) - this.lineStart(i), this.width);
            }
            this.width *= this.font.charWidth;
        }

        printableCharacters() {
            let total = 0;
            for (let i = 0; i < this.linebreaks.length + 1; i++) {
                total += this.lineEnd(i) - this.lineStart(i);
            }
            return total;
        }

        lineEnd(lineIndex: number) {
            const prevEnd = lineIndex > 0 ? this.linebreaks[lineIndex - 1] : 0;
            let end = lineIndex < this.linebreaks.length ? this.linebreaks[lineIndex] : this.text.length;
            let didMove = false;

            // Trim trailing whitespace
            while (end > prevEnd) {
                if (this.text.charCodeAt(end) <= 32) {
                    end--;
                    didMove = true
                }
                else if (this.text.charAt(end) === "n" && this.text.charAt(end - 1) === "\\" && end - 1 > prevEnd) {
                    end -= 2;
                    didMove = true
                }
                else {
                    break;
                }
            }
            return didMove ? end + 1 : end;
        }

        lineStart(lineIndex: number) {
            let start = lineIndex > 0 ? this.linebreaks[lineIndex - 1] : 0;

            // Trim leading whitespace
            while (start < this.text.length) {
                if (this.text.charCodeAt(start) <= 32) {
                    start ++;
                }
                else if (this.text.charAt(start) === "\\" && this.text.charAt(start + 1) === "n" && start + 1 < this.text.length) {
                    start += 2;
                }
                else {
                    break;
                }
            }

            return start;
        }

        widthOfLine(lineIndex: number, fullTextOffset?: number) {
            if (fullTextOffset != undefined) {
                return (Math.min(this.lineEnd(lineIndex), fullTextOffset + 1) - this.lineStart(lineIndex)) * this.font.charWidth;
            }
            return (this.lineEnd(lineIndex) - this.lineStart(lineIndex)) * this.font.charWidth;
        }

        widthOfLines(lineStartIndex: number, lineEndIndex: number, offset?: number) {
            if (this.linebreaks.length === 0) return this.widthOfLine(0, offset);

            let width = 0;
            let fullTextOffset: number;
            for (let i = lineStartIndex; i < Math.min(lineEndIndex, this.linebreaks.length + 1); i++) {
                if (offset != undefined) {
                    fullTextOffset = this.lineStart(i) + offset;
                    offset -= this.lineEnd(i) - this.lineStart(i);
                }
                if (fullTextOffset !== undefined && this.lineStart(i) > fullTextOffset) break;
                width = Math.max(width, this.widthOfLine(i, fullTextOffset));
            }
            return width;
        }
    }


    function isBreakCharacter(charCode: number) {
        return charCode <= 32 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126);
    }

    function getLineBreaks(text: string, lineLengths: number[]): number[] {
        const result: number[] = [];

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;
        let lineLength = lineLengths[line];

        function nextLine() {
            line++;
            lineLength = lineLengths[line % lineLengths.length];
        }

        for (let index = 0; index < text.length; index++) {
            if (text.charAt(index) === "\n") {
                result.push(index);
                index++;
                lastBreak = index;
                nextLine();
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(index) === "\\" && text.charAt(index + 1) === "n") {
                result.push(index);
                lastBreak = index;
                index += 2;
                nextLine();
            }
            else if (isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === lineLength) {
                if (lastBreakLocation === index || lastBreakLocation <= lastBreak) {
                    result.push(index);
                    lastBreak = index;
                    nextLine();
                }
                else {
                    result.push(lastBreakLocation);
                    lastBreak = lastBreakLocation;
                    nextLine();
                }
            }
        }

        return result;
    }

    enum RenderTextAnimationState {
        Idle,
        Printing,
        Pausing
    }

    export class RenderTextAnimation {
        protected tickPeriod: number;
        protected state: RenderTextAnimationState;
        protected pageLine: number;
        protected timer: number;
        protected pauseMillis: number;
        protected onTickCB: () => void;
        protected onEndCB: () => void;
        protected prevOffset: number;

        constructor(public text: RenderText, public height: number) {
            this.state = RenderTextAnimationState.Idle;
            this.timer = -1;

            this.pageLine = 0;
            this.setPauseLength(1000);
            this.setTextSpeed(30);
        }

        start() {
            this.state = RenderTextAnimationState.Printing;
            this.timer = control.millis();
        }

        numPages() {
            const maxLinesPerPage =  Math.idiv(this.height, this.text.lineHeight()) + 1;
            return Math.floor((this.text.linebreaks.length + 1) / maxLinesPerPage);
        }

        setPauseLength(millis: number) {
            this.pauseMillis = millis;
        }

        setTextSpeed(charactersPerSecond: number) {
            this.tickPeriod = 1000/ charactersPerSecond;
        }

        currentHeight() {
            const minHeight = this.text.lineHeight();
            const maxHeight = Math.max(
                Math.min(
                    Math.idiv(this.height, this.text.lineHeight()) + 1,
                    this.text.linebreaks.length + 1 - this.pageLine
                ) * this.text.lineHeight(),
                minHeight
            );


            if (this.state === RenderTextAnimationState.Printing) {
                return Math.max(Math.min(
                    this.text.calculatePartialHeight(this.pageLine, this.currentOffset()),
                    maxHeight
                ), minHeight)
            }
            else if (this.state === RenderTextAnimationState.Pausing) {
                return maxHeight
            }
            else {
                return 0;
            }
        }

        currentWidth() {
            return this.text.widthOfLines(
                this.pageLine,
                this.pageLine + Math.idiv(this.currentHeight(), this.text.lineHeight()) + 1,
                this.state === RenderTextAnimationState.Printing ? this.currentOffset() : undefined
            );
        }

        currentOffset() {
            return Math.idiv(control.millis() - this.timer, this.tickPeriod)
        }

        isDone() {
            return this.state === RenderTextAnimationState.Idle;
        }

        cancel() {
            this.state = RenderTextAnimationState.Idle;
        }

        onCharacterPrinted(cb: () => void) {
            this.onTickCB = cb;
        }

        onAnimationEnd(cb: () => void) {
            this.onEndCB = cb;
        }

        draw(canvas: Image, left: number, top: number, color: number) {
            if (this.state === RenderTextAnimationState.Idle) return;
            else if (this.state === RenderTextAnimationState.Printing) {
                const pageFinished = this.text.drawPartial(
                    canvas,
                    left,
                    top,
                    color,
                    this.currentOffset(),
                    this.pageLine,
                    this.pageLine + Math.idiv(this.height, this.text.lineHeight()) + 1
                );

                if (this.onTickCB && this.prevOffset !== this.currentOffset()) {
                    this.onTickCB();
                }

                if (pageFinished) {
                    this.state = RenderTextAnimationState.Pausing;
                    this.timer = this.pauseMillis
                }
            }
            else {
                this.text.draw(
                    canvas,
                    left,
                    top,
                    color,
                    this.pageLine,
                    this.pageLine + Math.idiv(this.height, this.text.lineHeight()) + 1
                );

                this.timer -= game.currentScene().eventContext.deltaTimeMillis;

                if (this.timer < 0) {
                    this.pageLine += Math.idiv(this.height, this.text.lineHeight()) + 1;
                    if (this.pageLine > this.text.linebreaks.length) {
                        this.state = RenderTextAnimationState.Idle;
                        if (this.onEndCB) this.onEndCB();
                    }
                    else {
                        this.state = RenderTextAnimationState.Printing;
                        this.timer = control.millis();
                    }
                }
            }

            this.prevOffset = this.currentOffset();
        }
    }
}