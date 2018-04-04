/**
 * Game transitions and dialog
 **/
//% color=#008272 weight=99 icon="\uf111"
//% groups='["Gameplay", "Background", "Tiles"]'
namespace game {
    export class Camera {
        offsetX: number;
        offsetY: number;
        sprite: Sprite;
        private oldOffsetX: number;
        private oldOffsetY: number;

        constructor() {
            this.offsetX = 0;
            this.offsetY = 0;

            this.oldOffsetX = 0;
            this.oldOffsetY = 0;
        }

        update() {
            // if sprite, follow sprite
            if (this.sprite) {
                this.offsetX = this.sprite.x - (screen.width >> 1);
                this.offsetY = this.sprite.y - (screen.height >> 1);
            }

            // don't escape tile map
            if (game.scene.tileMap) {
                this.offsetX = game.scene.tileMap.offsetX(this.offsetX);
                this.offsetY = game.scene.tileMap.offsetY(this.offsetY);
            }

            if (this.oldOffsetX != this.offsetX 
                || this.oldOffsetY != this.offsetY) {
                this.oldOffsetX = this.offsetX;
                this.oldOffsetY = this.offsetY;
                if (game.scene.tileMap)
                    game.scene.tileMap.needsUpdate = true;
            }
        }
    }


    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: Sprite[];
        physicsEngine: PhysicsEngine;
        camera: Camera;
        flags: number;

        paintCallback: () => void;
        updateCallback: () => void;

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
            this.flags = 0;
            this.physicsEngine = new ArcadePhysicsEngine();
            this.camera = new Camera();
            this.background = new Background(this.camera);
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            game.setBackgroundColor(0)
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(9, () => {
                if (this.tileMap)
                    this.tileMap.update(scene.camera);
            })
            // apply physics 10
            this.eventContext.registerFrameHandler(10, () => {
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.move(dt);
            })
            // user update 20
            // apply collisions 30
            this.eventContext.registerFrameHandler(30, () => {
                const dt = this.eventContext.deltaTime;
                this.camera.update();
                this.physicsEngine.collisions();
                for (const s of this.allSprites)
                    s.__update(this.camera, dt);
            })
            // render background 60
            this.eventContext.registerFrameHandler(60, () => {
                this.background.render();
            })
            // paint 75
            // render sprites 90
            this.eventContext.registerFrameHandler(90, () => {
                if (scene.flags & Flag.NeedsSorting)
                    this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of this.allSprites)
                    s.__draw(this.camera);
            })
            // render diagnostics
            this.eventContext.registerFrameHandler(150, () => {
                if (game.debug)
                    this.physicsEngine.draw();
                // clear flags
                scene.flags = 0;
            });
            // update screen
            this.eventContext.registerFrameHandler(200, control.__screen.update);
        }
    }

    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    /**
     * Determins if diagnostics are shown
     */
    export let debug = false;
    export let gameOverSound: () => void = undefined;

    export let scene: Scene;
    let sceneStack: Scene[];


    let __waitAnyKey: () => void
    let __isOver = false;

    export function setWaitAnyKey(f: () => void) {
        __waitAnyKey = f
    }

    export function waitAnyKey() {
        if (__waitAnyKey) __waitAnyKey()
        else pause(3000)
    }

    export function eventContext(): control.EventContext {
        init();
        return scene.eventContext;
    }

    export function init() {
        if (!scene) scene = new Scene(control.pushEventContext());
        scene.init();
    }

    export function pushScene() {
        init();
        if (!sceneStack) sceneStack = [];
        sceneStack.push(scene);
        scene = undefined;
        init();
    }

    export function popScene() {
        init();
        if (sceneStack && sceneStack.length) {
            scene = sceneStack.pop();
            control.popEventContext();
        }
    }

    /**
     * Sets the game background color
     * @param color
     */
    //% group="Background"
    //% weight=25
    //% blockId=gamesetbackgroundcolor block="set background color %color=colorindexpicker"
    export function setBackgroundColor(color: number) {
        init();
        scene.background.color = color;
    }

    /**
     * Adds a moving background layer
     * @param distance distance of the layer which determines how fast it moves, eg: 10
     * @param img
     */
    //% group="Background"
    //% weight=10
    //% blockId=gameaddbackgroundimage block="add background image %image=screen_image_picker||distance %distance|aligned %alignment"
    export function addBackgroundImage(image: Image, distance?: number, alignment?: BackgroundAlignment) {
        init();
        if (image)
            scene.background.addLayer(image, distance || 100, alignment || BackgroundAlignment.Bottom);
    }

    /**
     * Sets the map for rendering tiles
     * @param map
     */
    //% blockId=gamesettilemap block="set tile map to %map=screen_image_picker"
    //% group="Tiles"
    export function setTileMap(map: Image) {
        init();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(scene.camera, 16, 16);
        scene.tileMap.setMap(map);
    }

    /**
     * Sets the tile image at the given index
     * @param index
     * @param img
     */
    //% blockId=gamesettile block="set tile color %index=colorindexpicker to %img=screen_image_picker||with collisions %collisions=toggleOnOff"
    //% group="Tiles"
    export function setTile(index: number, img: Image, collisions?: boolean) {
        init();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(scene.camera, img.width, img.height);
        scene.tileMap.setTile(index, img, !!collisions);
    }

    //% blockId=colorindexpicker block="%index" blockHidden=true shim=TD_ID
    //% index.fieldEditor="colornumber"
    //% index.fieldOptions.valueMode="index"
    //% index.fieldOptions.colours='["#dedede","#ffffff","#33e2e4","#05b3e0","#3d30ad","#b09eff","#5df51f","#6a8927","#65471f","#98294a","#f80000","#e30ec0","#ff9da5","#ff9005","#efe204","#000000"]'
    export function _colorIndexPicker(index: number) {
        return index;
    }

    /**
     * The game camera follows a particular sprite
     * @param sprite 
     */
    //% blockId=camerafollow block="camera follow %sprite=variables_get"
    //% group="Tiles"
    export function cameraFollowSprite(sprite: Sprite) {
        init();
        game.scene.camera.sprite = sprite;
    }

    function showDialogBackground(h: number, c: number) {
        const top = (screen.height - h) >> 1;
        if (screen.isMono) {
            screen.fillRect(0, top, screen.width, h, 0)
            screen.drawLine(0, top, screen.width, top, 1)
            screen.drawLine(0, top + h - 1, screen.width, top + h - 1, 1)
        } else {
            screen.fillRect(0, top, screen.width, h, c)
        }

        return top;
    }

    /**
     * Show a title, subtitle menu
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=90
    //% blockId=gameSplash block="splash %title||%subtitle"
    export function splash(title: string, subtitle?: string) {
        init();
        control.pushEventContext();
        showDialog(title, subtitle)
        waitAnyKey()
        control.popEventContext();
    }

    /**
     * Prompts the user for a boolean question
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=89
    //% blockId=gameask block="ask %title||%subtitle"
    export function ask(title: string, subtitle?: string): boolean {
        init();
        control.pushEventContext();
        showDialog(title, subtitle, "A = OK, B = CANCEL");
        let answer: boolean = null;
        keys.A.onEvent(KeyEvent.Pressed, () => answer = true);
        keys.B.onEvent(KeyEvent.Pressed, () => answer = false);
        pauseUntil(() => answer !== null);
        control.popEventContext();
        return answer;
    }

    function showDialog(title: string, subtitle: string, footer?: string) {
        init();
        let h = 8;
        if (title)
            h += image.font8.charHeight;
        if (subtitle)
            h += 2 + image.font5.charHeight
        h += 8;
        const top = showDialogBackground(h, 9)
        if (title)
            screen.print(title, 8, top + 8, screen.isMono ? 1 : 14, image.font8);
        if (subtitle)
            screen.print(subtitle, 8, top + 8 + image.font8.charHeight + 2, screen.isMono ? 1 : 13, image.font5);
        if (footer) {
            screen.print(
                footer,
                screen.width - footer.length * image.font5.charWidth - 8,
                screen.height - image.font5.charHeight - 2,
                1,
                image.font5
            )
        }
    }

    function meltScreen() {
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 1000; ++j) {
                let x = Math.randomRange(0, screen.width - 1)
                let y = Math.randomRange(0, screen.height - 3)
                let c = screen.getPixel(x, y)
                screen.setPixel(x, y + 1, c)
                screen.setPixel(x, y + 2, c)
            }
            pause(100)
        }
    }

    /**
     * Finishes the game and displays score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over"
    //% weight=80
    export function over() {
        init();
        if (__isOver) return
        __isOver = true;
        // clear all handlers
        control.pushEventContext();
        // one last screenshot
        takeScreenshot();
        control.runInParallel(() => {
            if (gameOverSound) gameOverSound();
            meltScreen();
            let top = showDialogBackground(44, 4)
            screen.printCenter("GAME OVER!", top + 8, screen.isMono ? 1 : 5, image.font8)
            if (info.hasScore()) {
                screen.printCenter("Score:" + info.score(), top + 23, screen.isMono ? 1 : 2, image.font5)
                if (info.score() > info.highScore()) {
                    info.saveHighScore();
                    screen.printCenter("New High Score!", top + 32, screen.isMono ? 1 : 2, image.font5);
                } else {
                    screen.printCenter("HI" + info.highScore(), top + 32, screen.isMono ? 1 : 2, image.font5);
                }
            }
            pause(2000) // wait for users to stop pressing keys
            waitAnyKey()
            control.reset()
        })
    }

    /**
     * Tells the game host to grab a screenshot
     */
    //% shim=game::takeScreenshot
    declare function takeScreenshot(): void;

    /**
     * Updates the position and velocities of sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/update weight=100 afterOnStart=true
    //% blockId=gameupdate block="game frame"
    export function update(a: () => void): void {
        init();
        if (!scene.updateCallback) {
            game.eventContext().registerFrameHandler(20, function () {
                if (scene.updateCallback) scene.updateCallback();
            });
            scene.updateCallback = a;
        }
    }

    /**
     * Draw on screen before sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/paint weight=10 afterOnStart=true
    //% blockId=gamepaint block="game paint"
    export function paint(a: () => void): void {
        init();
        if (!scene.paintCallback) {
            game.eventContext().registerFrameHandler(75, function () {
                if (scene.paintCallback) scene.paintCallback();
            });
            scene.paintCallback = a;
        }
    }
}
