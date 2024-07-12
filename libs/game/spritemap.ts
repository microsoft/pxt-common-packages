namespace sprites {
    export interface ISpriteMap {
        insertSprite(sprite: Sprite): void;
        getOverlappingSprites(sprite: Sprite): Sprite[];
        draw(): void;
        reset(sprites: Sprite[]): void;
    }

    export class SpriteMap implements ISpriteMap {
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
        private neighbors(sprite: Sprite): { [key: string]: Sprite } {
            const neighbors: { [key: string]: Sprite } = {};

            const layer = sprite.layer;
            this.mergeAtKey(sprite.left, sprite.top, layer, neighbors)
            this.mergeAtKey(sprite.left, sprite.bottom, layer, neighbors)
            this.mergeAtKey(sprite.right, sprite.top, layer, neighbors)
            this.mergeAtKey(sprite.right, sprite.bottom, layer, neighbors)
            neighbors[sprite.id] = undefined;

            return neighbors;
        }

        /**
         * Gets the overlaping sprites if any
         * @param sprite
         */
        public getOverlappingSprites(sprite: Sprite): Sprite[] {
            control.enablePerfCounter("spritemap_overlaps");
            const neighbors = this.neighbors(sprite);

            const overlappingSprites: Sprite[] = [];
            for (const key of Object.keys(neighbors)) {
                const neighbor = neighbors[key];
                if (neighbor && sprite.overlapsWith(neighbor)) {
                    overlappingSprites.push(neighbor);
                }
            }

            return overlappingSprites;
        }

        public draw() {
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
        private resizeBuckets(sprites: Sprite[]) {
            // rescale buckets
            let maxWidth = 0;
            let maxHeight = 0;
            for (const sprite of sprites) {
                if (sprite.width > maxWidth) maxWidth = sprite.width;
                if (sprite.height > maxHeight) maxHeight = sprite.height;
            }

            const tMap = game.currentScene().tileMap;

            const areaWidth = tMap ? tMap.areaWidth() : screen.width;
            const areaHeight = tMap ? tMap.areaHeight() : screen.height;

            this.cellWidth = Math.clamp(8, areaWidth >> 2, maxWidth * 2);
            this.cellHeight = Math.clamp(8, areaHeight >> 2, maxHeight * 2);
            this.rowCount = Math.idiv(areaHeight, this.cellHeight);
            this.columnCount = Math.idiv(areaWidth, this.cellWidth);
        }

        /**
         * Clears the spritemap and recomputes the buckets
         * @param sprites 
         */
        public reset(sprites: Sprite[]) {
            this.buckets = [];
            this.resizeBuckets(sprites);
        }

        private key(x: number, y: number): number {
            const xi = Math.clamp(0, this.columnCount, Math.idiv(x, this.cellWidth));
            const yi = Math.clamp(0, this.rowCount, Math.idiv(y, this.cellHeight));
            return xi + yi * this.columnCount;
        }

        private insertAtKey(x: number, y: number, sprite: Sprite) {
            const k = this.key(x, y);
            let bucket = this.buckets[k];
            if (!bucket)
                bucket = this.buckets[k] = [];
            if (bucket.indexOf(sprite) < 0)
                bucket.push(sprite);
        }

        public insertSprite(sprite: Sprite) {
            const left = sprite.left;
            const top = sprite.top;
            const xn = Math.idiv(sprite.width + this.cellWidth - 1, this.cellWidth);
            const yn = Math.idiv(sprite.height + this.cellHeight - 1, this.cellHeight);
            for (let x = 0; x <= xn; x++)
                for (let y = 0; y <= yn; y++)
                    this.insertAtKey(left + Math.min(sprite.width, x * this.cellWidth), top + Math.min(sprite.height, y * this.cellHeight), sprite)
        }

        private mergeAtKey(x: number, y: number, layer: number, neighbors: { [key: string]: Sprite }) {
            const k = this.key(x, y);
            const bucket = this.buckets[k];
            if (bucket) {
                for (const sprite of bucket) {
                    if ((sprite.layer & layer) && neighbors[sprite.id] === undefined) {
                        neighbors[sprite.id] = sprite;
                    }
                } 
            }
        }

        toString() {
            return `${this.buckets.length} buckets, ${this.buckets.filter(b => !!b).length} filled`;
        }
    }
}