namespace jacdac {
    let jacdacConsole = false;
    scene.systemMenu.addEntry(
        () => jacdacConsole ? "hide jacdac console" : "show jacdac console", 
        () => {

        }, 
        false, 
        () => {
            jacdacConsole = !jacdacConsole;
            if (jacdacConsole)
                jacdac.consoleService.start();
            else
                jacdac.consoleService.stop();
            game.consoleOverlay.setVisible(jacdacConsole);
        }
    );
}