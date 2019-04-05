namespace jacdac {
    scene.systemMenu.addEntry(
        () => jacdac.consoleService.consoleMode == JDConsoleMode.Listen ? "hide jacdac console" : "show jacdac console",
        () => {
            if (jacdac.consoleService.consoleMode == JDConsoleMode.Listen) {
                game.consoleOverlay.setVisible(false);
                jacdac.consoleService.setConsoleMode(JDConsoleMode.Off);
            }
            else {
                game.consoleOverlay.setVisible(true);
                jacdac.consoleService.setConsoleMode(JDConsoleMode.Listen);
                console.log(`listening to jacdac...`);
            }
        },
        false
    );

    // prepare listening
    jacdac.consoleService.start();
}