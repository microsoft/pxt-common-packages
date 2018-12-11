namespace jacdac {
    let jacdacConsole = false;
    scene.systemMenu.addEntry(
        () => jacdacConsole ? "hide jacdac console" : "show jacdac console",
        () => {
            jacdacConsole = !jacdacConsole;
            game.consoleOverlay.setVisible(jacdacConsole);
            if (jacdacConsole) {
                jacdac.consoleService.start();
                console.log(`listening to jacdac...`);
            }
            else
                jacdac.consoleService.stop();

        },
        false
    );
}