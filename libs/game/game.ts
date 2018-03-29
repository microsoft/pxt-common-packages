/**
 * Game transitions and dialog
 **/
//% color=#008272 weight=99 icon="\uf111"
//% groups='["Gameplay", "Background", "Tiles"]'
namespace game {

    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: Sprite[];
        physicsEngine: PhysicsEngine;

        paintCallback: () => void;
        updateCallback: () => void;

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            this.background = new Background();
            game.setBackgroundColor(0)
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(9, () => {
                if(this.tileMap) this.tileMap.update();
            })
            // update sprites
            this.eventContext.registerFrameHandler(10, () => {
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.update(dt);
                for (const s of this.allSprites)
                    s.__update(dt);
            })
            // update 20
            // render background
            this.eventContext.registerFrameHandler(60, () => {
                this.background.render();
            })
            // paint 75
            // render sprites
            this.eventContext.registerFrameHandler(90, () => {
                if (flags & Flag.NeedsSorting)
                    this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of this.allSprites)
                    s.__draw();
            })
            // render diagnostics
            this.eventContext.registerFrameHandler(150, () => {
                if (game.debug)
                    this.physicsEngine.draw();
                // clear flags
                flags = 0;
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
    export let flags: number = 0;
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
    //% blockId=gamesetbackgroundcolor block="set background color %color"
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
    //% image.fieldEditor="sprite"
    //% image.fieldOptions.taggedTemplate="img"
    //% blockId=gameaddbackgroundimage block="add background image %image||distance %distance|aligned %alignment"
    export function addBackgroundImage(image: Image, distance?: number, alignment?: BackgroundAlignment) {
        init();
        if (image)
            scene.background.addLayer(image, distance || 100, alignment || BackgroundAlignment.Bottom);
    }

    /**
     * Moves the background by the given value
     * @param dx
     * @param dy
     */
    //% group="Background"
    //% weight=20
    //% blockId=backgroundmove block="move background dx %dx dy %dy"
    export function moveBackground(dx: number, dy: number) {
        init();
        scene.background.viewX += dx;
        scene.background.viewY += dy;
    }

    /**
     * Sets the map for rendering tiles
     * @param map
     */
    //% blockId=gamesettilemap block="set tile map to %map"
    //% map.fieldEditor="sprite"
    //% map.fieldOptions.taggedTemplate="img"
    //% group="Tiles"
    export function setTileMap(map: Image) {
        init();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(16, 16);
        scene.tileMap.setMap(map);
    }

    /**
     * Sets the tile image at the given index
     * @param index
     * @param img
     */
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
    //% blockId=gamesettile block="set tile at %index to %img||with collisions %collisions=toggleOnOff"
    //% group="Tiles"
    export function setTile(index: number, img: Image, collisions?: boolean) {
        init();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(img.width, img.height);
        scene.tileMap.setTile(index, img, !!collisions);
    }

    /**
     * Changes the tilemap offset
    */
    //% blockId=gamesettileoffset block="change tile offset by x %x y %y"
    //% group="Tiles"
    export function changeTileOffsetBy(dx: number, dy: number) {
        init();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(16, 16);
        scene.tileMap.offsetX += dx;
        scene.tileMap.offsetY += dy;
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
        keys.A.onEvent(KeyEvent.Pressed, () => answer = true );
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
