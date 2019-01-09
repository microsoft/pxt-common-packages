namespace scene {
    export class Camera {
        offsetX: number;
        offsetY: number;
        sprite: Sprite;
        private oldOffsetX: number;
        private oldOffsetY: number;

        constructor() {
            this.offsetX = 0;
            this.offsetY = 0;

            this.oldOffsetX = 0;
            this.oldOffsetY = 0;
        }

        update() {
            const scene = game.currentScene();

            // if sprite, follow sprite
            if (this.sprite) {
                this.offsetX = Fx.toIntShifted(this.sprite._x, 0) + (this.sprite.width >> 1) - (screen.width >> 1);
                this.offsetY = Fx.toIntShifted(this.sprite._y, 0) + (this.sprite.height >> 1) - (screen.height >> 1);
            }

            // don't escape tile map
            if (scene.tileMap && scene.tileMap.enabled) {
                this.offsetX = scene.tileMap.offsetX(this.offsetX);
                this.offsetY = scene.tileMap.offsetY(this.offsetY);
            }

            this.offsetX |= 0;
            this.offsetY |= 0;

            if (this.oldOffsetX != this.offsetX
                || this.oldOffsetY != this.offsetY) {
                this.oldOffsetX = this.offsetX;
                this.oldOffsetY = this.offsetY;
            }
        }
    }
}