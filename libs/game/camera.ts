namespace scene {
    export class Camera {
        offsetX: number;
        offsetY: number;
        sprite: Sprite;
        private oldOffsetX: number;
        private oldOffsetY: number;

        private shakeStartTime: number;
        private shakeDuration: number;
        private shakeAmplitude: number;
        private shakeOffsetX: number;
        private shakeOffsetY: number;

        constructor() {
            this.offsetX = 0;
            this.offsetY = 0;

            this.oldOffsetX = 0;
            this.oldOffsetY = 0;
        }

        shake(amplitude: number = 4, duration: number = 1000) {
            if (amplitude <= 0 || duration <= 0) {
                this.shakeStartTime = undefined;
            } else {
                // this overrides any existing shake operation            
                this.shakeStartTime = control.millis();
                this.shakeAmplitude = amplitude;
                this.shakeDuration = duration;
                // don't reset offset, will be recomputed in update
            }
        }

        update() {
            const scene = game.currentScene();

            // remove previous shake offset
            if (this.shakeOffsetX !== undefined) {
                this.offsetX -= this.shakeOffsetX;
                this.offsetY -= this.shakeOffsetY;
                this.shakeOffsetX = undefined;
                this.shakeOffsetY = undefined;
            }

            // if sprite, follow sprite
            if (this.sprite) {
                this.offsetX = this.sprite.x - (screen.width >> 1);
                this.offsetY = this.sprite.y - (screen.height >> 1);
            }

            // don't escape tile map
            if (scene.tileMap && scene.tileMap.enabled) {
                this.offsetX = scene.tileMap.offsetX(this.offsetX);
                this.offsetY = scene.tileMap.offsetY(this.offsetY);
            }

            // normalize offset
            this.offsetX |= 0;
            this.offsetY |= 0;

            // apply shake if needed
            if (this.shakeStartTime !== undefined) {
                const elapsed = control.millis() - this.shakeStartTime;
                if (elapsed >= this.shakeDuration) {
                    // we are done!
                    this.shakeStartTime = undefined;
                } else {
                    // compute new shake
                    const percentComplete = elapsed / this.shakeDuration;
                    const dampStart = 0.75;
                    let damp = 1;
                    if (percentComplete >= dampStart)
                        damp = Math.max(0, 1 - percentComplete);
                    const f = this.shakeAmplitude * damp;
                    this.shakeOffsetX = (Math.random() * f) >> 0;
                    this.shakeOffsetY = (Math.random() * f) >> 0;
                    // apply to offset
                    this.offsetX += this.shakeOffsetX;
                    this.offsetY += this.shakeOffsetY;
                }
            }

            if (this.oldOffsetX != this.offsetX
                || this.oldOffsetY != this.offsetY) {
                this.oldOffsetX = this.offsetX;
                this.oldOffsetY = this.offsetY;
            }
        }
    }
}