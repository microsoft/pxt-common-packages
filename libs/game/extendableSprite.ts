namespace sprites {
    /**
     * A version of the Sprite class that is easier to extend.
     * 
     * Unlike the normal Sprite class, this class will automatically add
     * itself to the physics engine and run all sprite created handlers
     * in the constructor
     */
    export class ExtendableSprite extends Sprite {
        constructor(spriteImage: Image, kind?: number) {
            super(spriteImage);

            const scene = game.currentScene();
            this.setKind(kind);
            scene.physicsEngine.addSprite(this);
    
            // run on created handlers
            scene.createdHandlers
                .filter(h => h.kind == kind)
                .forEach(h => h.handler(this));
        }

        /**
         * Override to change how the sprite is drawn to the screen
         * 
         * @param drawLeft The left position to draw the sprite at (already adjusted for camera)
         * @param drawTop The top position to draw the sprite at (already adjusted for camera)
         */
        draw(drawLeft: number, drawTop: number) {
            super.drawSprite(drawLeft, drawTop);
        }

        /**
         * Override to add update logic for a sprite. This method runs once per frame
         * 
         * @param deltaTimeMillis The time that has elapsed since the last frame in milliseconds
         */
        update(deltaTimeMillis: number) {
        }
        
        __update(camera: scene.Camera, dt: number) {
            super.__update(camera, dt);
            this.update(game.currentScene().eventContext.deltaTimeMillis)
        }

        protected drawSprite(drawLeft: number, drawTop: number): void {
            this.draw(drawLeft, drawTop);
        }
    }

}