namespace scene.systemMenu {
    export let active = false;

    interface MenuItem {
        name: () => string;
        handler: () => void;
        repeat?: boolean;
    }
    let customItems: MenuItem[] = undefined;
    export function addEntry(name: () => string, handler: () => void, repeat?: boolean) {
        if (!customItems) customItems = [];
        customItems.push({
            name: name,
            handler: handler,
            repeat: repeat
        });
    }

    export function register() {
        if (active) return; // don't show system menu, while in system menu

        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            active = true;
            let itemHandler: () => void = undefined;
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
            if (customItems)
                customItems.forEach(item => {
                    m.addItem(item.name(), () => {
                        if (item.repeat) item.handler();
                        else {
                            itemHandler = item.handler;
                            m.hide();
                        }
                    })
                });
            m.onDidHide = () => {
                active = false;
                if (itemHandler)
                    itemHandler();
            }
            m.show();
        })
    }
}