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
            const initHeight = 12;
            const finalHeight = screen.height - 10;
            const finalWidth = screen.width - 10;
            const f = new menu.RoundedFrame(5, 1, 3);
            const b = new menu.Bounds(initHeight, initHeight);
            b.left = 30;
            b.top = 30;
            b.appendChild(f)
            const list = new menu.VerticalList(finalWidth - 8, finalHeight - 8);
            list.addItem("console", 0);
            list.addItem("volume up", 1);
            list.addItem("volume down", 2);
            const root = new menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
            root.appendChild(list)
            menu.setRoot(root);

            const vert = b.animate(menu.setHeight)
                .from(initHeight)
                .to(finalHeight)
                .duration(200);

            const hori = b.animate(menu.setWidth)
                .from(initHeight)
                .to(finalWidth)
                .duration(200);

            vert.chain(hori);
            vert.start();

            list.show();

            // b handler
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                const vert = b.animate(menu.setHeight)
                    .from(100)
                    .to(initHeight)
                    .duration(200);
                const hori = b.animate(menu.setWidth)
                    .from(150)
                    .to(0)
                    .duration(200)
                hori.chain(vert);
                hori.start();

                pauseUntil(() => !hori.running);
                root.dispose();
                systemMenuActive = false;
            })
        })
    }
}