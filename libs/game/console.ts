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

    export function setVisible(value: boolean) {
        if (value != !!consoleStrings)
            consoleStrings = value ? [] : undefined;
    }

    function listener(priority: ConsolePriority, text: string) {
        if (!consoleStrings)
            return;

        // split text into lines
        text = text || "";
        for (let j = 0; j < text.length; j += consoleColumns) {
            const line = text.substr(j, consoleColumns);
            if (consoleStrings.length < consoleLines)
                consoleStrings.push(line);
            else {
                for (let i = 1; i < consoleStrings.length; ++i)
                    consoleStrings[i - 1] = consoleStrings[i];
                consoleStrings[consoleStrings.length - 1] = line;
            }
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