namespace jacdac {
    scene.systemMenu.addEntry(
        () => jacdac.consoleService().consoleMode == jacdac.JDConsoleMode.Listen ? "hide jacdac console" : "show jacdac console",
        () => {
            if (jacdac.consoleService().consoleMode == jacdac.JDConsoleServiceMode.Listen) {
                game.consoleOverlay.setVisible(false);
                jacdac.consoleService().consoleMode = jacdac.JDConsoleServiceMode.Off;
            }
            else {
                game.consoleOverlay.setVisible(true);
                jacdac.consoleService().consoleMode = jacdac.JDConsoleMode.Listen;
                console.log(`listening to jacdac...`);
            }
        },
        false
    );

    // prepare listening
    jacdac.consoleService();
}