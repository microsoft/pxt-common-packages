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
        tileIndex: number;
        tilemap: tiles.TileMap;
    }

    export class StaticObstacle implements Obstacle {
        layer: number;
        image: Image;
        tileIndex: number;

        top: number;
        left: number;
        tilemap: tiles.TileMap;

        constructor(image: Image, top: number, left: number, layer: number, tileIndex?: number, tilemap?: tiles.TileMap) {
            this.image = image;
            this.layer = layer;
            this.top = top;
            this.left = left;
            this.tileIndex = tileIndex;
            this.tilemap = tilemap;
        }

        get x(): number {
            return this.left + (this.width >> 1);
        }

        get y(): number {
            return this.top + (this.height >> 1);
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
}