namespace sprites {
    export class SpriteMap {
        private cellWidth: number;
        private cellHeight: number;
        private rowCount: number;
        private columnCount: number;
        private buckets: Sprite[][];

        constructor() {
            this.buckets = [];
        }

        /**
         * Returns a potential list of neighbors
         */
        neighbors(sprite: Sprite): Sprite[] {
            const neighbors: Sprite[] = [];
            const layer = sprite.layer;
            // TODO: This is just looking at the four corners and not the
            // interior of the sprite. Long sprites that are orthogonal will not
            // trigger
            for (const coord of this.getBucketCoordinates(sprite)) {
                this.mergeAtKey(coord.x, coord.y, layer, neighbors);
            }
            neighbors.removeElement(sprite);
            return neighbors;
        }

        /**
         * Gets the overlapping sprites if any
         * @param sprite
         */
        overlaps(sprite: Sprite): Sprite[] {
            const potentialNeighbors = this.neighbors(sprite);
            const neighbors = potentialNeighbors.filter(neighbor =>
                sprite.overlapsWith(neighbor)
            );
            return neighbors;
        }

        draw(camera: scene.Camera) {
            // Include camera offset
            for (let x = 0; x < this.columnCount; ++x) {
                for (let y = 0; y < this.rowCount; ++y) {
                    const left = x * this.cellWidth - camera.drawOffsetX;
                    const top = y * this.cellHeight - camera.drawOffsetY;
                    const key = this.key(left, top);
                    const bucket = this.buckets[key];
                    if (bucket && bucket.length)
                        screen.drawRect(
                            left,
                            top,
                            this.cellWidth,
                            this.cellHeight,
                            5
                        );
                }
            }
        }

        /**
         * Recompute hashes for all objects
         */
        resizeBuckets(sprites: Sprite[]) {
            // rescale buckets
            let maxWidth = 0;
            let maxHeight = 0;
            for (const sprite of sprites) {
                if (sprite.width > maxWidth) maxWidth = sprite.width;
                if (sprite.height > maxHeight) maxHeight = sprite.height;
            }

            const tMap = game.currentScene().tileMap;

            // What to do when there is no tile map? A game can be more than just screen width and height.
            // Maybe just a multiplier?
            const areaWidth = tMap ? tMap.areaWidth() : screen.width;
            const areaHeight = tMap ? tMap.areaHeight() : screen.height;

            this.cellWidth = Math.clamp(8, areaWidth >> 2, maxWidth * 2);
            this.cellHeight = Math.clamp(8, areaHeight >> 2, maxHeight * 2);
            this.rowCount = Math.ceil(areaHeight / this.cellHeight);
            this.columnCount = Math.ceil(areaWidth / this.cellWidth);
        }

        clear() {
            this.buckets = [];
        }

        private key(x: number, y: number): number {
            const xi = Math.clamp(
                0,
                this.columnCount,
                Math.idiv(x, this.cellWidth)
            );
            const yi = Math.clamp(
                0,
                this.rowCount,
                Math.idiv(y, this.cellHeight)
            );
            return xi + yi * this.columnCount;
        }

        private insertAtKey(x: number, y: number, sprite: Sprite) {
            const key = this.key(x, y);
            let bucket = this.buckets[key];
            if (!bucket) bucket = this.buckets[key] = [];
            if (bucket.indexOf(sprite) < 0) bucket.push(sprite);
        }

        private getBucketCoordinates(sprite: Sprite) {
            const left = sprite.left;
            const top = sprite.top;
            const xn = Math.idiv(
                sprite.width + this.cellWidth - 1,
                this.cellWidth
            );
            const yn = Math.idiv(
                sprite.height + this.cellHeight - 1,
                this.cellHeight
            );
            let coords = [];
            for (let x = 0; x <= xn; x++)
                for (let y = 0; y <= yn; y++)
                    coords.push({
                        x: left + Math.min(sprite.width, x * this.cellWidth),
                        y: top + Math.min(sprite.height, y * this.cellHeight),
                    });
            return coords;
        }

        insertAABB(sprite: Sprite) {
            for (const coord of this.getBucketCoordinates(sprite)) {
                this.insertAtKey(coord.x, coord.y, sprite);
            }
        }

        private mergeAtKey(
            x: number,
            y: number,
            layer: number,
            sprites: Sprite[]
        ) {
            const key = this.key(x, y);
            const bucket = this.buckets[key];
            if (bucket) {
                for (const sprite of bucket)
                    if (sprite.layer & layer && sprites.indexOf(sprite) < 0)
                        sprites.push(sprite);
            }
        }

        toString() {
            return `${this.buckets.length} buckets, ${
                this.buckets.filter(b => !!b).length
            } filled`;
        }
    }
}
