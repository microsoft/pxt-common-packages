namespace scene.systemMenu {
    export let active = false;

    interface MenuItem {
        name: () => string;
        clickHandler: () => void;
        repeat?: boolean;
        hiddenHandler?: () => void;
    }
    let customItems: MenuItem[] = undefined;
    export function addEntry(name: () => string, clickHandler: () => void, repeat?: boolean, hiddenHandler?: () => void) {
        if (!customItems) customItems = [];
        customItems.push({
            name: name,
            clickHandler: clickHandler,
            repeat: repeat,
            hiddenHandler: hiddenHandler
        });
    }

    export function register() {
        if (active) return; // don't show system menu, while in system menu

        controller.menu.onEvent(ControllerButtonEvent.Pressed, showSystemMenu);
    }

    //% shim=pxt::deepsleep
    function deepsleep() {}

    export function showSystemMenu() {
        active = true;
        let itemHandler: () => void = undefined;
        let onHidden: () => void = undefined;
        const m = new menu.Menu();
        m.addItem(game.stats ? "hide stats" : "show stats", () => {
            game.stats = !game.stats;
            m.hide();
        })
        m.addItem(game.consoleOverlay.isVisible() ? "hide console" : "show console", () => {
            if (game.consoleOverlay.isVisible())
                game.consoleOverlay.setVisible(false);
            else {
                game.consoleOverlay.setVisible(true);
                console.log("console");
            }
            m.hide();
        });
        m.addItem("volume up", () => {
            const v = music.volume();
            music.setVolume(v + 32);
            music.playTone(440, 500);
        });
        m.addItem("volume down", () => {
            const v = music.volume();
            music.setVolume(v - 32);
            music.playTone(440, 500);
        });
        m.addItem("sleep (MENU to wake)", () => {
            deepsleep();
        });

        if (customItems)
            customItems.forEach(item => {
                m.addItem(item.name(), () => {
                    if (item.repeat) item.clickHandler();
                    else {
                        itemHandler = item.clickHandler;
                        onHidden = item.hiddenHandler;
                        m.hide();
                    }
                })
            });
        m.onDidHide = () => {
            active = false;
            if (onHidden)
                onHidden();
            if (itemHandler)
                itemHandler();
        }
        m.show();
    }
}
