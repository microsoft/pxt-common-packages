namespace scene {
    export function registerSystemMenu() {
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
            console.log("menu")
            game.pushScene();

            const initHeight = 12;
            const f = new menu.RoundedFrame(5, 1, 3);
            const b = new menu.Bounds(initHeight, initHeight);
            b.left = 30;
            b.top = 30;
            b.appendChild(f)

            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                const vert = b.animate(setHeight)
                    .from(100)
                    .to(initHeight)
                    .duration(200);

                const hori = b.animate(setWidth)
                    .from(150)
                    .to(initHeight)
                    .duration(200)

                hori.chain(vert);
                hori.start();

                game.popScene();
            })

            const root = new menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
            menu.setRoot(root);

            const vert = b.animate(setHeight)
                .from(initHeight)
                .to(100)
                .duration(200);

            const hori = b.animate(setWidth)
                .from(initHeight)
                .to(150)
                .duration(200);

            vert.chain(hori);
            vert.start();
        })
    }
}