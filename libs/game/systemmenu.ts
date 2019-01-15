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
        m.addItem("button tester", () => {
            buttonTester();
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

    function buttonTester() {
        game.popScene(); // kill current game
        game.pushScene();
        function createButton(name: string, b: controller.Button, x: number, y: number) {
            const n = 24;
            const img = image.create(n, n);
            img.fill(6)
            img.printCenter(name, n / 2 - image.font8.charHeight / 2, 0, image.font8);
            const imgPressed = image.create(n, n);
            imgPressed.fill(7)
            imgPressed.printCenter(name, n / 2 - image.font8.charHeight / 2, 0, image.font8);
        
            const sprite = sprites.create(b.isPressed() ? imgPressed : img);
            sprite.setPosition(x, y);
            b.onEvent(ControllerButtonEvent.Pressed, function () {
                sprite.setImage(imgPressed);        
            })
            b.onEvent(ControllerButtonEvent.Released, function () {
                sprite.setImage(img);
            })
            b.onEvent(ControllerButtonEvent.Repeated, function () {
                sprite.say("repeat", 200)
            })
        }
        
        scene.setBackgroundColor(8)
        createButton("A", controller.A, 145, 30)
        createButton("B", controller.B, 115, 60)
        createButton("L", controller.left, 15, 60)
        createButton("U", controller.up, 45, 30)
        createButton("D", controller.down, 45, 90)
        createButton("R", controller.right, 75, 60)
    }
}
