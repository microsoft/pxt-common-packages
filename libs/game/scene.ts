/**
 * Control the background, tiles and camera
 */
//% groups='["Background", "Tiles", "Camera"]'
namespace scene {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    export interface SpriteHandler {
        type: number;
        handler: (sprite: Sprite) => void;
    }

    export interface OverlapHandler {
        type: number;
        otherType: number;
        handler: (sprite: Sprite, otherSprite: Sprite) => void;
    }

    export interface CollisionHandler {
        type: number;
        tile: number;
        handler: (sprite: Sprite) => void
    }

    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: SpriteLike[];
        physicsEngine: PhysicsEngine;
        camera: scene.Camera;
        flags: number;
        destroyedHandlers: SpriteHandler[];
        createdHandlers: SpriteHandler[];
        overlapHandlers: OverlapHandler[];
        collisionHandlers: CollisionHandler[];

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
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            scene.setBackgroundColor(0)
            // update controller state
            this.eventContext.registerFrameHandler(8, () => {
                performance.startTimer("controller_update")
                const dt = this.eventContext.deltaTime;
                controller.__update(dt);
                performance.stopTimer("controller_update")
            })
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(9, () => {
                if (this.tileMap) {
                    performance.startTimer("tilemap_update")
                    this.tileMap.update(this.camera);
                    performance.stopTimer("tilemap_update")
                }
            })
            // apply physics 10
            this.eventContext.registerFrameHandler(10, () => {
                performance.startTimer("physics")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.move(dt);
                performance.stopTimer("physics")
            })
            // user update 20
            // apply collisions 30
            this.eventContext.registerFrameHandler(30, () => {
                performance.startTimer("collisions")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.collisions();
                this.camera.update();
                for (const s of this.allSprites)
                    s.__update(this.camera, dt);
                performance.stopTimer("collisions")
            })
            // render background 60
            this.eventContext.registerFrameHandler(60, () => {
                this.background.render();
            })
            // paint 75
            // render sprites 90
            this.eventContext.registerFrameHandler(90, () => {
                if (this.flags & Flag.NeedsSorting)
                this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                performance.startTimer("sprite_draw")
                for (const s of this.allSprites)
                    s.__draw(this.camera);
                performance.stopTimer("sprite_draw")
            })
            // render diagnostics
            this.eventContext.registerFrameHandler(150, () => {
                if (game.debug)
                    this.physicsEngine.draw();
                // clear flags
                this.flags = 0;
            });
            // update screen
            this.eventContext.registerFrameHandler(200, control.__screen.update);
        }
    }
}