namespace game {
    export function showConsole() {
        const csl = new Console();
        console.log('console log')
        game.onUpdate(() => {
            if (controller.down.isPressed())
                csl.scroll(1);
            else if (controller.up.isPressed())
                csl.scroll(-1);
            else if (controller.B.isPressed()) {
                csl.hide();
            }
        })
        pauseUntil(() => csl.hidden());
    }

    class Console {
        private textOffset: number;
        private lineOffset: number;
        private maxLines: number;
        private screenLines: number;
        private lines: string[];
        private scrollPosition: number;
        private listener: (priority: ConsolePriority, text: string) => void;

        constructor() {
            controller._setUserEventsEnabled(false);
            game.pushScene();

            this.textOffset = 4;
            this.lineOffset = 2;
            this.maxLines = 200;
            this.screenLines = 1;
            this.scrollPosition = 0;

            this.screenLines = this.lineCount();
            const img = image.create(screen.width, screen.height);
            scene.setBackgroundImage(img);
            this.listener = (priority, text) => this.log(priority, text);
            console.addListener(this.listener);
            this.lines = [];
        }

        hidden() {
            return !this.lines;
        }

        public hide() {
            console.removeListener(this.listener);
            controller._setUserEventsEnabled(true);
            game.popScene();
        }

        lineHeight(): number {
            return image.font8.charHeight + this.lineOffset;
        }

        lineCount(): number {
            return ((screen.height - this.textOffset) / this.lineHeight()) >> 0
        }

        showString(text: string, line: number) {
            // line indexing starts at 1.
            line = (line - 1) >> 0;
            const nlines = this.lineCount();
            if (line < 0 || line >= nlines) return; // out of screen

            const h = this.lineHeight();
            const y = this.textOffset + h * line;
            const s = scene.backgroundImage();
            s.fillRect(0, y, screen.width, h, 0); // clear background
            s.print(text, this.textOffset, y, 1);
        }

        clear() {
            const s = scene.backgroundImage();
            s.fill(0)
        }

        printLog() {
            this.clear();
            if (!this.lines) return;
            this.screenLines = this.lineCount();
            const h = this.lineHeight();
            for (let i = 0; i < this.screenLines; ++i) {
                const line = this.lines[i + this.scrollPosition];
                if (line)
                    this.showString(line, i + 1);
            }
        }

        scroll(pos: number) {
            if (!pos) return;

            this.scrollPosition += pos >> 0;
            if (this.scrollPosition >= this.lines.length) this.scrollPosition = this.lines.length - 1;
            if (this.scrollPosition < 0) this.scrollPosition = 0;
            this.printLog();
        }

        log(priority: ConsolePriority, msg: string): void {
            this.lines.push(msg);
            if (this.lines.length + 5 > this.maxLines) {
                this.lines.splice(0, this.lines.length >> 1);
                this.scrollPosition = Math.min(this.scrollPosition, this.lines.length - 1)
            }
            // move down scroll once it gets large than the screen
            if (this.lines.length > this.screenLines
                && this.lines.length >= this.scrollPosition + this.screenLines) {
                this.scrollPosition++;
            }
            this.printLog();
        }
    }
}
