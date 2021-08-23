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

        protected lineEnd(index: number) {
            const prevEnd = index > 0 ? this.linebreaks[index - 1] : 0;
            let end = index < this.linebreaks.length ? this.linebreaks[index] : this.text.length;
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

        protected lineStart(index: number) {
            let start = index > 0 ? this.linebreaks[index - 1] : 0;

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
            const maxHeight = Math.min(
                Math.idiv(this.height, this.text.lineHeight()) + 1,
                this.text.linebreaks.length + 1 - this.pageLine
            ) * this.text.lineHeight();


            if (this.state === RenderTextAnimationState.Printing) {
                return Math.min(
                    this.text.calculatePartialHeight(this.pageLine, this.currentOffset()),
                    maxHeight
                );
            }
            else if (this.state === RenderTextAnimationState.Pausing) {
                return maxHeight
            }
            else {
                return 0;
            }
        }

        currentOffset() {
            return Math.idiv(control.millis() - this.timer, this.tickPeriod)
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
                    }
                    else {
                        this.state = RenderTextAnimationState.Printing;
                        this.timer = control.millis();
                    }
                }
            }
        }
    }
}