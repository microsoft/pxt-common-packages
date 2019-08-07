enum TileScale {
    //% block="8x8"
    Eight = 3,
    //% block="16x16"
    Sixteen = 4,
    //% block="32x32"
    ThirtyTwo = 5
}
namespace tiles {

    class TileSet {
        obstacle: boolean;
        private map: TileMap;
        private originalImage: Image;
        private cachedImage: Image;

        constructor(image: Image, collisions: boolean, map: TileMap) {
            this.originalImage = image;
            this.obstacle = collisions;
            this.map = map;
        }

        get image(): Image {
            const size = 1 << this.map.scale;
            if (!this.cachedImage || this.cachedImage.width != size || this.cachedImage.height != size) {
                if (this.originalImage.width == size && this.originalImage.height == size) {
                    this.cachedImage = this.originalImage;
                } else {
                    this.cachedImage = image.create(size, size);
                    this.cachedImage.drawImage(this.originalImage, 0, 0);
                }
            }
            return this.cachedImage;
        }
    }

    /**
     * A tile in the tilemap
     **/
    //% blockNamespace=scene color="#401255" blockGap=8
    export class Tile {
        private _row: number;
        private _col: number;
        private tileMap: TileMap;

        constructor(col: number, row: number, map: TileMap) {
            this._col = col;
            this._row = row;
            this.tileMap = map;
        }

        get x(): number {
            const scale = this.tileMap.scale;
            return (this._col << scale) + (1 << (scale - 1));
        }

        get y(): number {
            const scale = this.tileMap.scale;
            return (this._row << scale) + (1 << (scale - 1));
        }

        get tileSet(): number {
            return this.tileMap.image.getPixel(this._col, this._row) | 0;
        }

        /**
         * Center the given sprite on this tile
         * @param sprite
         */
        //% blockId=gameplaceontile block="on top of %tile(myTile) place %sprite=variables_get(mySprite)"
        //% blockNamespace="scene" group="Tiles"
        //% weight=25
        //% help=scene/place
        place(mySprite: Sprite): void {
            if (!mySprite) return;

            mySprite.x = this.x;
            mySprite.y = this.y;
        }
    }

    export class TileMap {
        scale: number

        private _layer: number;
        private _map: Image;
        private _tileSets: TileSet[];

        constructor(scale: TileScale = TileScale.Sixteen) {
            this._tileSets = [];
            this._layer = 1;
            this.scale = scale;

            scene.createRenderable(
                scene.TILE_MAP_Z,
                (t, c) => this.draw(t, c)
            );
        }

        get image(): Image {
            return this._map;
        }

        offsetX(value: number) {
            return Math.clamp(0, Math.max(this.areaWidth() - screen.width, 0), value);
        }

        offsetY(value: number) {
            return Math.clamp(0, Math.max(this.areaHeight() - screen.height, 0), value);
        }

        areaWidth() {
            return this._map ? (this._map.width << this.scale) : 0;
        }

        areaHeight() {
            return this._map ? (this._map.height << this.scale) : 0;
        }

        get layer(): number {
            return this._layer;
        }

        set layer(value: number) {
            if (this._layer != value) {
                this._layer = value;
            }
        }

        get enabled(): boolean {
            return !!this._map;
        }

        setTile(index: number, img: Image, collisions?: boolean) {
            if (this.isInvalidIndex(index)) return;
            this._tileSets[index] = new TileSet(img, collisions, this);
        }

        setMap(map: Image) {
            this._map = map;
        }

        public getTile(col: number, row: number): Tile {
            return new Tile(col, row, this);
        }

        public setTileAt(col: number, row: number, index: number): void {
            if (!this.isOutsideMap(col, row) && !this.isInvalidIndex(index))
                this._map.setPixel(col, row, index);
        }

        public getTilesByType(index: number): Tile[] {
            if (this.isInvalidIndex(index) || !this.enabled) return [];

            let output: Tile[] = [];
            for (let col = 0; col < this._map.width; ++col) {
                for (let row = 0; row < this._map.height; ++row) {
                    let currTile = this._map.getPixel(col, row);
                    if (currTile === index) {
                        output.push(new Tile(col, row, this));
                    }
                }
            }
            return output;
        }

        private generateTile(index: number): TileSet {
            const size = 1 << this.scale

            const i = image.create(size, size);
            i.fill(index);
            return this._tileSets[index] = new TileSet(i, false, this);
        }

        private isOutsideMap(col: number, row: number): boolean {
            return !this.enabled || col < 0 || col >= this._map.width
                || row < 0 || row >= this._map.height;
        }

        private isInvalidIndex(index: number): boolean {
            return index < 0 || index > 0xf;
        }

        protected draw(target: Image, camera: scene.Camera) {
            if (!this.enabled) return;

            // render tile map
            const bitmask = (0x1 << this.scale) - 1;
            const offsetX = camera.drawOffsetX & bitmask;
            const offsetY = camera.drawOffsetY & bitmask;

            const x0 = Math.max(0, camera.drawOffsetX >> this.scale);
            const xn = Math.min(this._map.width, ((camera.drawOffsetX + target.width) >> this.scale) + 1);
            const y0 = Math.max(0, camera.drawOffsetY >> this.scale);
            const yn = Math.min(this._map.height, ((camera.drawOffsetY + target.height) >> this.scale) + 1);

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tileSets[index] || this.generateTile(index);
                    if (tile) {
                        target.drawTransparentImage(
                            tile.image,
                            ((x - x0) << this.scale) - offsetX,
                            ((y - y0) << this.scale) - offsetY
                        );
                    }
                }
            }

            if (game.debug) {
                // render debug grid overlay
                for (let x = x0; x <= xn; ++x) {
                    const xLine = ((x - x0) << this.scale) - offsetX;
                    if (xLine >= 0 && xLine <= screen.width) {
                        target.drawLine(
                            xLine,
                            0,
                            xLine,
                            target.height,
                            1
                        );
                    }
                }

                for (let y = y0; y <= yn; ++y) {
                    const yLine = ((y - y0) << this.scale) - offsetY;
                    if (yLine >= 0 && yLine <= screen.height) {
                        target.drawLine(
                            0,
                            yLine,
                            target.width,
                            yLine,
                            1
                        );
                    }
                }
            }
        }

        public isObstacle(col: number, row: number) {
            if (!this.enabled) return false;
            if (this.isOutsideMap(col, row)) return true;

            let t = this._tileSets[this._map.getPixel(col, row)];
            return t && t.obstacle;
        }

        public getObstacle(col: number, row: number) {
            const index = this.isOutsideMap(col, row) ? 0 : this._map.getPixel(col, row);
            const tile = this._tileSets[index] || this.generateTile(index);
            return new sprites.StaticObstacle(
                tile.image,
                row << this.scale,
                col << this.scale,
                this.layer,
                index
            );
        }
    }
}
