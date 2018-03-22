/**
 * Game transitions and dialog
 **/
//% color=#008272 weight=99 icon="\uf1d8"
namespace game {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    /**
     * Determins if diagnostics are shown
     */
    export let debug = false;
    export let flags: number = 0;
    export let gameOverSound: () => void = undefined;
    let __eventContext: control.EventContext;
    let __isOver = false
    let __waitAnyKey: () => void
    let __background: Background;

    export function setWaitAnyKey(f: () => void) {
        __waitAnyKey = f
    }

    export function waitAnyKey() {
        if (__waitAnyKey) __waitAnyKey()
        else pause(3000)
    }

    export function eventContext(): control.EventContext {
        init();
        return __eventContext;
    }

    export function init() {
        if (!sprites.allSprites) {
            sprites.allSprites = []
            __eventContext = control.pushEventContext();
            __background = new Background();
            game.setBackground(0)
            __eventContext.registerFrameHandler(10, () => {
                const dt = __eventContext.deltaTime;
                physics.engine.update(dt);
                for (const s of sprites.allSprites)
                    s.__update(dt);
            })
            // update 20
            // render background
            __eventContext.registerFrameHandler(60, () => {
                __background.render();
            })
            // paint 75
            // render sprites
            __eventContext.registerFrameHandler(90, () => {
                if (flags & Flag.NeedsSorting)
                    sprites.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of sprites.allSprites)
                    s.__draw();
            })
            // render diagnostics
            __eventContext.registerFrameHandler(150, () => {
                if (game.debug)
                    physics.engine.draw();
                // clear flags
                flags = 0;
            });
            // update screen
            __eventContext.registerFrameHandler(200, control.__screen.update);
        }
    }

    /**
     * Sets the game background color
     * @param color 
     */
    //% weight=25
    //% blockId=gamesetbackgroundcolor block="set background to %color"
    export function setBackground(color: number) {
        init();
        __background.color = color;
    }

    /**
     * Adds a background layer
     * @param distance distance of the layer which determines how fast it moves
     * @param img 
     */
    //% weight=24
    //% _block="add background image|distance %distance|aligned % alignment|image %img"
    export function addBackgroundImage(distance: number, alignment: BackgroundAlignment, img: Image) {
        init();
        __background.addLayer(distance, alignment, img);
    }

    /**
     * Moves the background by the given value
     * @param dx 
     * @param dy 
     */
    //% weight=20
    //% blockId=backgroundmove block="move background dx %dx dy %dy"
    export function moveBackground(dx: number, dy: number) {
        init();
        __background.viewX += dx;
        __background.viewY += dy;
    }

    function showBackground(h: number, c: number) {
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
    //% weight=90
    //% blockId=gameSplash block="splash %title %subtitle"
    export function splash(title: string, subtitle: string) {
        init();
        control.pushEventContext();
        showDialog(title, subtitle)
        waitAnyKey()
        control.popEventContext();
    }

    function showDialog(title: string, subtitle: string) {
        const h = 8 + image.font8.charHeight + 2 + image.font5.charHeight + 8;
        const top = showBackground(h, 9)
        if (title)
            screen.print(title, 8, top + 8, screen.isMono ? 1 : 14, image.font8);
        if (subtitle)
            screen.print(subtitle, 8, top + 8 + image.font8.charHeight + 2, screen.isMono ? 1 : 13, image.font5);
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
            let top = showBackground(44, 4)
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

    let __updateCb: () => void = undefined;
    /**
     * Updates the position and velocities of sprites
     * @param body code to execute
     */
    //% help=game/update weight=100 afterOnStart=true
    //% blockId=gameupdate block="game frame"
    export function update(a: () => void): void {
        if (!__updateCb) {
            game.eventContext().registerFrameHandler(20, function () {
                if (__updateCb) __updateCb();
            });
            __updateCb = a;
        }
    }

    let __paintCb: () => void = undefined;
    /**
     * Draw on screen before sprites
     * @param body code to execute
     */
    //% help=game/paint weight=10 afterOnStart=true
    //% blockId=gamepaint block="game paint"
    export function paint(a: () => void): void {
        if (!__paintCb) {
            game.eventContext().registerFrameHandler(75, function () {
                if (__paintCb) __paintCb();
            });
            __paintCb = a;
        }
    }
}
