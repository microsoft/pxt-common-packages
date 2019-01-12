namespace scene.systemMenu {
    export let active = false;

    class MenuItem {
        constructor(
            public name: () => string,
            public clickHandler: () => void,
            public repeat?: boolean,
            public hiddenHandler?: () => void) { }
    }
    
    let customItems: MenuItem[] = undefined;
    export function addEntry(name: () => string, clickHandler: () => void, repeat?: boolean, hiddenHandler?: () => void) {
        if (!customItems) customItems = [];
        customItems.push(new MenuItem(name, clickHandler, repeat, hiddenHandler));
    }

    export function register() {
        if (active) return; // don't show system menu, while in system menu

        controller.menu.onEvent(ControllerButtonEvent.Pressed, showSystemMenu);
    }

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
