namespace game.consoleOverlay {
    let consoleColor = 1;
    let consoleStrings: string[];
    const marginx = 4;
    const marginy = 2;
    const consoleFont = image.font5;
    const consoleLines = Math.floor(screen.height / (consoleFont.charHeight + marginy)) - 1;
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
        else if (consoleStrings.length < consoleLines)
            consoleStrings.push(text);
        else {
            for (let i = 1; i < consoleStrings.length; ++i) {
                consoleStrings[i - 1] = consoleStrings[i];
            }
            consoleStrings[consoleStrings.length - 1] = text;
        }
    }

    export function draw() {
        if (!consoleStrings || scene.systemMenu.active) return;
        const height = consoleFont.charHeight + marginy ;
        const top = 2 + (game.stats ? height : 0);
        for (let i = 0; i < consoleStrings.length; ++i) {
            const t = consoleStrings[i];
            screen.print(t, marginx, top + i * height, consoleColor, consoleFont);
        }
    }
}