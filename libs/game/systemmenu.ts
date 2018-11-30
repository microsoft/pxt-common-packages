namespace scene {
    export let systemMenuActive = false;
    export function registerSystemMenu() {
        if (systemMenuActive) {
            return;
        }

        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            systemMenuActive = true;
            const m = new menu.Menu();
            m.addItem("volume up", () => {});
            m.addItem("volume down", () => {});
            m.addItem("brightness up", () => {});
            m.addItem("brightness down", () =>{});
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
            m.onHidden = () => systemMenuActive = false;
            m.show();
        })
    }
}