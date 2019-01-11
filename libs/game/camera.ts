namespace scene {
    export class Camera {
        // coordinate used for all physics computation
        offsetX: number;
        offsetY: number;
        // coordinate used for draw sprites, may including shaking
        drawOffsetX: number;
        drawOffsetY: number;
        sprite: Sprite;

        private shakeStartTime: number;
        private shakeDuration: number;
        private shakeAmplitude: number;

        constructor() {
            this.offsetX = 0;
            this.offsetY = 0;

            this.drawOffsetX = 0;
            this.drawOffsetY = 0;
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

            this.drawOffsetX = this.offsetX;
            this.drawOffsetY = this.offsetY;

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
                    const x = (Math.random() * f) >> 0;
                    const y = (Math.random() * f) >> 0;
                    // apply to offset
                    this.drawOffsetX += x;
                    this.drawOffsetY += y;
                }
            }
        }
    }
}