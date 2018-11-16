namespace scene {
    let suppressMenu = false;
    export function registerSystemMenu() {
        if (suppressMenu) {
            console.log('menu suppresed')
            return;
        }

        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            console.log('creating menu')
            suppressMenu = true;
            const initHeight = 12;
            const f = new menu.RoundedFrame(5, 1, 3);
            const b = new menu.Bounds(initHeight, initHeight);
            b.left = 30;
            b.top = 30;
            b.appendChild(f)
            const root = new menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
            const list = new menu.VerticalList(root.width - 10, root.height - 10, root.width - 20, root.height - 20);
            root.appendChild(list)
            list.addItem("console", 0);
            list.addItem("volume up", 1);
            list.addItem("volume down", 2);
            menu.setRoot(root);

            const vert = b.animate(menu.setHeight)
                .from(initHeight)
                .to(100)
                .duration(200);

            const hori = b.animate(menu.setWidth)
                .from(initHeight)
                .to(150)
                .duration(200);

            vert.chain(hori);
            vert.start();

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
                suppressMenu = false;
            })
        })
    }
}