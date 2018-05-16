/**
 * Control the background, tiles and camera
 */
//% groups='["Background", "Tiles", "Camera"]'
namespace scene {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: SpriteLike[];
        physicsEngine: PhysicsEngine;
        camera: scene.Camera;
        flags: number;

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
            this.flags = 0;
            this.physicsEngine = new ArcadePhysicsEngine();
            this.camera = new scene.Camera();
            this.background = new Background(this.camera);
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            scene.setBackgroundColor(0)
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
                this.camera.update();
                this.physicsEngine.collisions();
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