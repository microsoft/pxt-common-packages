namespace jacdac {
    scene.systemMenu.addEntry(
        () => jacdac.consoleDriver.mode == JDConsoleMode.Listen ? "hide jacdac console" : "show jacdac console",
        () => {
            if (jacdac.consoleDriver.mode == JDConsoleMode.Listen) {
                game.consoleOverlay.setVisible(false);
                jacdac.consoleDriver.setMode(JDConsoleMode.Off);
            }
            else {
                game.consoleOverlay.setVisible(true);
                jacdac.consoleDriver.setMode(JDConsoleMode.Listen);
                console.log(`listening to jacdac...`);
            }
        },
        false
    );

    // prepare listening
    jacdac.consoleDriver.setMode(JDConsoleMode.Off);
}