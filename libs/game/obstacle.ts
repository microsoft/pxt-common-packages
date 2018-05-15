namespace sprites {
    enum ObstacleFlags {
        Moved = 1 << 4,
        Dead = 1 << 5
    }

    export interface Obstacle {
        x: number;
        y: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
        layer: number;
        image: Image;
    }

    export class StaticObstacle implements Obstacle {
        layer: number;
        image: Image;

        top: number;
        left: number;

        constructor(image: Image, top: number, left: number, layer: number) {
            this.image = image;
            this.layer = layer;
            this.top = top;
            this.left = left;
        }

        get x(): number {
            return this.left + this.width >> 1;
        }

        get y(): number {
            return this.top + this.height >> 1;
        }

        get height(): number {
            return this.image.height;
        }

        get width(): number {
            return this.image.width;
        }

        get bottom(): number {
            return this.top + this.height;
        }

        get right(): number {
            return this.left + this.width;
        }
    }

    export class DynamicObstacle implements Obstacle {
        layer: number;
        image: Image;

        flags: number;

        private _x: number;
        private _y: number;

        constructor(image: Image, top: number, left: number) {
            this.image = image;
            this.layer = 1;
            this._x = left + image.width >> 1;
            this._y = top + image.height >> 1;
            this.flags = 0;
        }

        get x(): number {
            return this._x;
        }

        set x(x: number) {
            if (x !== this._x) this.flags |= ObstacleFlags.Moved;
            this._x = x;
        }

        get y(): number {
            return this._y;
        }

        set y(y: number) {
            if (y !== this._y) this.flags |= ObstacleFlags.Moved;
            this._y = y;
        }

        get height(): number {
            return this.image.height;
        }

        get width(): number {
            return this.image.width;
        }

        get left(): number {
            return this._x - (this.width >> 1);
        }

        get top(): number {
            return this._y - (this.height >> 1);
        }

        get bottom(): number {
            return this.top + this.height;
        }

        get right(): number {
            return this.left + this.width;
        }

        isOutOfScreen(camera: scene.Camera): boolean {
            const ox = camera.offsetX;
            const oy = camera.offsetY;

            const right = this.x + (this.width >> 1);
            const bottom = this.y + (this.height >> 1);

            return right - ox < 0 || bottom - oy < 0 || this.left - ox > screen.width || this.top - oy > screen.height;
        }

        destroy() {
            if (this.flags & ObstacleFlags.Dead) return;
            this.flags |= ObstacleFlags.Dead;
        }
    }
}