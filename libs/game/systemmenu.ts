namespace scene {
    let systemMenuActive = false;
    export function registerSystemMenu() {
        if (systemMenuActive) {
            console.log('menu suppresed')
            return;
        }

        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            console.log('creating menu')
            systemMenuActive = true;
            const m = new menu.Menu();
            m.addItem("volume up", () => {});
            m.addItem("volume down", () => {});
            m.addItem("brightness up", () => {});
            m.addItem("brightness down", () =>{});
            m.addItem("console", () => {});
            menu.setRoot(m);
            m.grow();

            const hide = () => {
                m.shrink(() => {
                    m.dispose();
                    systemMenuActive = false;
                })
            }

            // b handler
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                hide();
            });
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                hide();
                game.showConsole();
            });
        })
    }
}