/**
 * Control the background, tiles and camera
 */
namespace scene {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    export interface SpriteHandler {
        kind: number;
        handler: (sprite: Sprite) => void;
    }

    export interface OverlapHandler {
        kind: number;
        otherKind: number;
        handler: (sprite: Sprite, otherSprite: Sprite) => void;
    }

    export interface CollisionHandler {
        kind: number;
        tile: number;
        handler: (sprite: Sprite) => void
    }

    export const CONTROLLER_PRIORITY = 8;
    export const TILEMAP_PRIORITY = 9;
    export const PHYSICS_PRIORITY = 10;
    export const ANIMATION_UPDATE_PRIORITY = 15;
    export const UPDATE_INTERVAL_PRIORITY = 19;
    export const UPDATE_PRIORITY = 20;
    export const UPDATE_CONTROLLER_PRIORITY = 19;
    export const CONTROLLER_SPRITES_PRIORITY = 19;
    export const OVERLAP_PRIORITY = 30;
    export const RENDER_BACKGROUND_PRIORITY = 60;
    export const PAINT_PRIORITY = 75;
    export const RENDER_SPRITES_PRIORITY = 90;
    export const SHADE_PRIORITY = 94;
    export const HUD_PRIORITY = 95;
    export const RENDER_DIAGNOSTICS_PRIORITY = 150;
    export const UPDATE_SCREEN_PRIORITY = 200;

    export class Scene {
        eventContext: control.EventContext;
        menuState: menu.State;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: SpriteLike[];
        private spriteNextId: number;
        spritesByKind: SpriteSet[];
        physicsEngine: PhysicsEngine;
        camera: scene.Camera;
        flags: number;
        destroyedHandlers: SpriteHandler[];
        createdHandlers: SpriteHandler[];
        overlapHandlers: OverlapHandler[];
        collisionHandlers: CollisionHandler[];
        particleSources: particles.ParticleSource[];
        controlledSprites: controller.ControlledSprite[][];

        private _millis: number;
        private _data: any;

        // a set of functions that need to be called when a scene is being initialized
        static initializers: ((scene: Scene) => void)[] = [];

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
            this.flags = 0;
            this.physicsEngine = new ArcadePhysicsEngine();
            this.camera = new scene.Camera();
            this.background = new Background(this.camera);
            this.destroyedHandlers = [];
            this.createdHandlers = [];
            this.overlapHandlers = [];
            this.collisionHandlers = [];
            this.spritesByKind = [];
            this.controlledSprites = [];
            this._data = {};
            this._millis = 0;
        }

        init() {
            if (this.allSprites) return;

            power.poke(); // keep game alive a little more
            this.allSprites = [];
            this.spriteNextId = 0;
            // update controller state
            this.eventContext.registerFrameHandler(CONTROLLER_PRIORITY, () => {
                this._millis += this.eventContext.deltaTimeMillis;
                control.enablePerfCounter("controller_update")
                controller.__update(this.eventContext.deltaTime);
            })
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(TILEMAP_PRIORITY, () => {
                control.enablePerfCounter("tilemap_update")
                if (this.tileMap) {
                    this.tileMap.update(this.camera);
                }
            })
            // apply physics 10
            this.eventContext.registerFrameHandler(PHYSICS_PRIORITY, () => {
                control.enablePerfCounter("physics")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.move(dt);
            })
            // controller update 19
            this.eventContext.registerFrameHandler(CONTROLLER_SPRITES_PRIORITY, controller._moveSprites);
            // user update 20
            // apply collisions 30
            this.eventContext.registerFrameHandler(OVERLAP_PRIORITY, () => {
                control.enablePerfCounter("collisions")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.collisions();
                this.camera.update();
                for (const s of this.allSprites)
                    s.__update(this.camera, dt);
            })
            // render background 60
            this.eventContext.registerFrameHandler(RENDER_BACKGROUND_PRIORITY, () => {
                control.enablePerfCounter("render background")
                this.background.draw();
            })
            // paint 75
            // render sprites 90
            this.eventContext.registerFrameHandler(RENDER_SPRITES_PRIORITY, () => {
                control.enablePerfCounter("sprite_draw")
                if (this.flags & Flag.NeedsSorting)
                    this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of this.allSprites)
                    s.__draw(this.camera);
            })
            // render diagnostics
            this.eventContext.registerFrameHandler(RENDER_DIAGNOSTICS_PRIORITY, () => {
                if (game.stats && control.EventContext.onStats) {
                    control.EventContext.onStats(
                        control.EventContext.lastStats +
                        ` sprites:${this.allSprites.length}`
                    )
                }
                if (game.debug)
                    this.physicsEngine.draw();
                game.consoleOverlay.draw();
                // clear flags
                this.flags = 0;
                // check for power deep sleep
                power.checkDeepSleep();
            });
            // update screen
            this.eventContext.registerFrameHandler(UPDATE_SCREEN_PRIORITY, control.__screen.update);
            // register additional components
            Scene.initializers.forEach(f => f(this));
        }

        get data() {
            return this._data;
        }

        /**
         * Gets the elapsed time in the scene
         */
        millis(): number {
            return this._millis;
        }

        addSprite(sprite: SpriteLike) {
            this.allSprites.push(sprite);
            sprite.id = this.spriteNextId++;
        }

        destroy() {
            this.eventContext = undefined;
            this.menuState = undefined;
            this.background = undefined;
            this.tileMap = undefined;
            this.allSprites = undefined;
            this.spriteNextId = undefined;
            this.spritesByKind = undefined;
            this.physicsEngine = undefined;
            this.camera = undefined;
            this.flags = undefined;
            this.destroyedHandlers = undefined;
            this.createdHandlers = undefined;
            this.overlapHandlers = undefined;
            this.collisionHandlers = undefined;
            this._data = undefined;
        }
    }
}
