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

            const b = new menu.Bounds(initHeight, initHeight);

            const f = new menu.RoundedFrame(5, 1, 3);
            b.left = 30;
            b.top = 30;
            b.appendChild(f)

            const list = new menu.VerticalList(finalWidth - 8, finalHeight - 8, finalWidth - 24, finalHeight - 24);
            list.addItem("volume up", 0);
            list.addItem("volume down", 1);
            list.addItem("brightness up", 2);
            list.addItem("brightness down", 3);
            list.addItem("console", 4);
            f.appendChild(list);

            const root = new menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
            menu.setRoot(root);

            const vert = b.animate(menu.setHeight)
                .from(initHeight)
                .to(finalHeight)
                .duration(200);

            const hori = b.animate(menu.setWidth)
                .from(initHeight)
                .to(finalWidth)
                .duration(200);

            const anim = vert.chain(hori);
            anim.start();
            pauseUntil(() => !anim.running);
            list.show();

            // b handler
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                list.hide();
                const vert = b.animate(menu.setHeight)
                    .from(100)
                    .to(initHeight)
                    .duration(200);
                const hori = b.animate(menu.setWidth)
                    .from(150)
                    .to(0)
                    .duration(200)
                const anim = hori.chain(vert);
                anim.start();

                pauseUntil(() => !anim.running);
                root.dispose();
                systemMenuActive = false;
            });
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                game.showConsole();
            });
        })
    }
}