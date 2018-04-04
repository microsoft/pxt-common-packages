/**
 * Control the background, tiles and camera
 */
//% groups='["Background", "Tiles", "Camera"]'
namespace scenes {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }
    
    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: Sprite[];
        physicsEngine: PhysicsEngine;
        camera: scenes.Camera;
        flags: number;

        paintCallback: () => void;
        updateCallback: () => void;

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
            this.flags = 0;
            this.physicsEngine = new ArcadePhysicsEngine();
            this.camera = new scenes.Camera();
            this.background = new Background(this.camera);
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            scenes.setBackgroundColor(0)
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(9, () => {
                if (this.tileMap)
                    this.tileMap.update(this.camera);
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
                if (this.flags & Flag.NeedsSorting)
                    this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of this.allSprites)
                    s.__draw(this.camera);
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