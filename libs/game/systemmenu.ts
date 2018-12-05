namespace scene.systemMenu {
    export let active = false;

    interface MenuItem {
        name: () => string;
        handler: () => void;
    }
    let customItems: MenuItem[] = undefined;
    export function addEntry(name: () => string, handler: () => void) {
        if (!customItems) customItems = [];
        customItems.push({
            name: name,
            handler: handler
        });
    }

    export function register() {
        if (active) return; // don't show system menu, while in system menu

        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            active = true;            
            let itemHandler: () => void = undefined;
            const m = new menu.Menu();            
            m.addItem("volume", () => {});
            m.addItem("brightness", () => {});
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
                        m.hide();
                        itemHandler = item.handler;
                    })
                });                
            m.onHidden = () => {
                active = false;
                if (itemHandler)
                    itemHandler();
            }
            m.show();
        })
    }
}