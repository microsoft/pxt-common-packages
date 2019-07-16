namespace game.consoleOverlay {
    let consoleColor = 1;
    let consoleStrings: string[];
    const marginx = 4;
    const marginy = 2;
    const consoleFont = image.font5;
    const consoleLines = Math.floor(screen.height / (consoleFont.charHeight + marginy)) - 1;
    const consoleColumns = Math.floor((screen.width - 2 * marginx) / consoleFont.charWidth);
    console.addListener(listener);

    export function isVisible() {
        return !!consoleStrings;
    }

    export function clear() {
        consoleStrings = [];
    }

    export function setVisible(value: boolean, col?: number) {
        if (value != !!consoleStrings)
            consoleStrings = value ? [] : undefined;
        if (col !== undefined)
            consoleColor = col;
    }

    function listener(priority: ConsolePriority, text: string) {
        if (!consoleStrings)
            return;

        // split text into lines
        text = text || "";

        text.split("\n")
            .filter(line => !!line)
            .forEach(line => {
                for (let j = 0; j < line.length; j += consoleColumns) {
                    consoleStrings.push(line.slice(j, consoleColumns));
                }
            });

        if (consoleStrings.length > consoleLines) {
            consoleStrings.splice(0, consoleStrings.length - consoleLines);
        }
    }

    export function draw() {
        if (!consoleStrings || scene.systemMenu.isVisible()) return;
        const height = consoleFont.charHeight + marginy;
        const top = 2 + (game.stats ? height : 0);
        for (let i = 0; i < consoleStrings.length; ++i) {
            const t = consoleStrings[i];
            screen.print(t, marginx, top + i * height, consoleColor, consoleFont);
        }
    }
}