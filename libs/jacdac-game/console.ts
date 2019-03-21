namespace jacdac {
    scene.systemMenu.addEntry(
        () => jacdac.consoleService.mode == JDConsoleMode.Listen ? "hide jacdac console" : "show jacdac console",
        () => {
            if (jacdac.consoleService.mode == JDConsoleMode.Listen) {
                game.consoleOverlay.setVisible(false);
                jacdac.consoleService.setMode(JDConsoleMode.Off);
            }
            else {
                game.consoleOverlay.setVisible(true);
                jacdac.consoleService.setMode(JDConsoleMode.Listen);
                console.log(`listening to jacdac...`);
            }
        },
        false
    );

    // prepare listening
    jacdac.consoleService.start();
}