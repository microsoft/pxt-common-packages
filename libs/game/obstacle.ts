namespace sprites {
    enum ObstacleFlags {
        Moved = 1 << 4,
        Dead = 1 << 5
    }

    export class Obstacle implements SpriteLike {
        z: number;
        id: number;
        layer: number;
        image: Image;

        flags: number;

        private _x: number;
        private _y: number;

        constructor(image: Image) {
            this.image = image;
            this.layer = 1;
            this._x = 0;
            this._y = 0;
            this.z = 0;
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

        __update(camera: scene.Camera, dt: number): void {
        }

        __draw(camera: scene.Camera): void {
            if (this.isOutOfScreen(camera)) return;

            const left = this.x - (this.width >> 1) - camera.offsetX;
            const top = this.y - (this.height >> 1) - camera.offsetY;
            screen.drawTransparentImage(this.image, left, top);
        }

        destroy() {
            if (this.flags & ObstacleFlags.Dead) return;
            this.flags |= ObstacleFlags.Dead;
            game.currentScene().allSprites.removeElement(this);
        }
    }


    export class ObstacleMap {
        private cellWidth: number;
        private cellHeight: number;
        private rowCount: number;
        private columnCount: number;
        private buckets: Obstacle[][];

        private minX: number;
        private minY: number;

        constructor() {
            this.buckets = [];
            this.minX = 0;
            this.minY = 0;
        }

        /**
         * Returns a potential list of neighbors
         */
        neighbors(sprite: Sprite): Obstacle[] {
            const n: Obstacle[] = [];
            const layer = sprite.layer;
            this.mergeAtKey(sprite.left, sprite.top, layer, n)
            this.mergeAtKey(sprite.left, sprite.bottom, layer, n)
            this.mergeAtKey(sprite.right, sprite.top, layer, n)
            this.mergeAtKey(sprite.right, sprite.bottom, layer, n)
            return n;
        }

        /**
         * Gets the overlaping sprites if any
         * @param sprite
         */
        overlaps(sprite: Sprite): Obstacle[] {
            const n = this.neighbors(sprite);
            const o = n.filter(neighbor => sprite.overlapsWithObstacle(neighbor));
            return o;
        }

        draw() {
            for (let x = 0; x < this.columnCount; ++x) {
                for (let y = 0; y < this.rowCount; ++y) {
                    const left = x * this.cellWidth;
                    const top = y * this.cellHeight;
                    const k = this.key(left, top);
                    const b = this.buckets[k];
                    if (b && b.length)
                        screen.drawRect(left, top, this.cellWidth, this.cellHeight, 5);
                }
            }
        }

        /**
         * Recompute hashes for all objects
         */
        update(obstacles: Obstacle[]) {
            this.buckets = [];

            // rescale buckets
            let maxWidth = 0;
            let maxHeight = 0;

            let minX = obstacles[0].left;
            let minY = obstacles[0].top;
            let maxX = obstacles[0].right;
            let maxY = obstacles[0].bottom;

            for (const obstacle of obstacles) {
                minX = Math.min(obstacle.left, minX);
                minY = Math.min(obstacle.top, minY);
                maxX = Math.max(obstacle.right, maxX);
                maxY = Math.max(obstacle.bottom, maxY);

                if (obstacle.width > maxWidth) maxWidth = obstacle.width;
                if (obstacle.height > maxHeight) maxHeight = obstacle.height;
            }

            this.minX = minX;
            this.minY = minY;

            this.cellWidth = Math.clamp(8, screen.width / 4, maxWidth * 2);
            this.cellHeight = Math.clamp(8, screen.height / 4, maxHeight * 2);
            this.rowCount = ((maxY - minY )/ this.cellHeight) >> 0
            this.columnCount = ((maxX - minX) / this.cellWidth) >> 0;


            for (const obstacle of obstacles) {
                this.insertAABB(obstacle);
                pause(1);
            }
        }

        private key(x: number, y: number): number {
            const xi = Math.clamp(0, this.columnCount, ((x - this.minX) / this.cellWidth) >> 0);
            const yi = Math.clamp(0, this.rowCount, ((y - this.minY) / this.cellHeight) >> 0);
            return xi + yi * this.columnCount;
        }

        private insertAtKey(x: number, y: number, obstacle: Obstacle) {
            const k = this.key(x, y);
            let bucket = this.buckets[k];
            if (!bucket)
                bucket = this.buckets[k] = [];
            if (bucket.indexOf(obstacle) < 0)
                bucket.push(obstacle);
        }

        private insertAABB(obstacle: Obstacle) {
            const left = obstacle.left;
            const top = obstacle.top;
            const xn = Math.ceil(obstacle.width / this.cellWidth)
            const yn = Math.ceil(obstacle.height / this.cellHeight);
            for (let x = 0; x <= xn; x++)
                for (let y = 0; y <= yn; y++)
                    this.insertAtKey(left + Math.min(obstacle.width, x * this.cellWidth), top + Math.min(obstacle.height, y * this.cellHeight), obstacle)
        }

        private mergeAtKey(x: number, y: number, layer: number, n: Obstacle[]) {
            const k = this.key(x, y);
            const bucket = this.buckets[k];
            if (bucket) {
                for (const obstacle of bucket)
                    if ((obstacle.layer & layer)
                        && n.indexOf(obstacle) < 0)
                        n.push(obstacle);
            }
        }

        toString() {
            return `${this.buckets.length} buckets, ${this.buckets.filter(b => !!b).length} filled`;
        }
    }

    export function createObstacle2(image: Image) {
        const o = new Obstacle(image);
        game.currentScene().allSprites.push(o);
        return o;
    }
}