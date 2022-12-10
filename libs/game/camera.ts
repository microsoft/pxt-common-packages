namespace scene {
    export class Camera {
        // coordinate used for all physics computation
        protected _offsetX: number;
        protected _offsetY: number;

        // coordinate used for draw sprites, may including shaking
        drawOffsetX: number;
        drawOffsetY: number;
        sprite: Sprite;
        protected _lastUpdatedSpriteX: number;
        protected _lastUpdatedSpriteY: number;

        protected shakeStartTime: number;
        protected shakeDuration: number;
        protected shakeAmplitude: number;

        constructor() {
            this._offsetX = 0;
            this._offsetY = 0;

            this.drawOffsetX = 0;
            this.drawOffsetY = 0;
        }

        get offsetX() {
            return this._offsetX;
        }
        set offsetX(v: number) {
            const scene = game.currentScene();
            if (scene.tileMap && scene.tileMap.enabled) {
                this._offsetX = Math.floor(scene.tileMap.offsetX(v));
            } else {
                this._offsetX = Math.floor(v);
            }
        }
        get offsetY() {
            return this._offsetY;
        }
        set offsetY(v: number) {
            const scene = game.currentScene();
            if (scene.tileMap && scene.tileMap.enabled) {
                this._offsetY = Math.floor(scene.tileMap.offsetY(v));
            } else {
                this._offsetY = Math.floor(v);
            }
        }

        get x() {
            return this.offsetX + (screen.width >> 1);
        }
        get y() {
            return this.offsetY + (screen.height >> 1);
        }
        get left() {
            return this.offsetX;
        }
        get right() {
            return this.offsetX + screen.width;
        }
        get top() {
            return this.offsetY;
        }
        get bottom() {
            return this.offsetY + screen.height;
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

        isUpdated() {
            return !this.sprite || (this.sprite.x === this._lastUpdatedSpriteX && this.sprite.y === this._lastUpdatedSpriteY);
        }

        update() {
            // if sprite, follow sprite
            if (this.sprite) {
                this._lastUpdatedSpriteX = this.sprite.x;
                this._lastUpdatedSpriteY = this.sprite.y;
                this.offsetX = this.sprite.x - (screen.width >> 1);
                this.offsetY = this.sprite.y - (screen.height >> 1);
            }

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