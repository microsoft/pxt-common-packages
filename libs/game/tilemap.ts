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

    export class TileMap implements SpriteLike {
        id: number;
        z: number;
        scale: number

        private _layer: number;

        private _map: Image;
        private _tileSets: TileSet[];

        constructor(scale: TileScale = TileScale.Sixteen) {
            this._tileSets = [];
            this._layer = 1;
            this.z = -1;
            this.scale = scale;

            const sc = game.currentScene();
            sc.addSprite(this);
            sc.flags |= scene.Flag.NeedsSorting;
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

        __serialize(offset: number): Buffer { return undefined; }

        __update(camera: scene.Camera, dt: number): void { }

        /**
         * Draws all visible
         */
        __draw(camera: scene.Camera): void {
            if (!this.enabled) return;

            const bitmask = (0x1 << this.scale) - 1;
            const offsetX = camera.drawOffsetX & bitmask;
            const offsetY = camera.drawOffsetY & bitmask;

            const x0 = Math.max(0, camera.drawOffsetX >> this.scale);
            const xn = Math.min(this._map.width, ((camera.drawOffsetX + screen.width) >> this.scale) + 1);
            const y0 = Math.max(0, camera.drawOffsetY >> this.scale);
            const yn = Math.min(this._map.height, ((camera.drawOffsetY + screen.height) >> this.scale) + 1);

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tileSets[index] || this.generateTile(index);
                    if (tile) {
                        screen.drawTransparentImage(
                            tile.image,
                            ((x - x0) << this.scale) - offsetX,
                            ((y - y0) << this.scale) - offsetY
                        );
                    }
                }
            }
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

        draw(camera: scene.Camera) {
            if (!this.enabled) return;

            if (game.debug) {
                const offsetX = -camera.drawOffsetX;
                const offsetY = -camera.drawOffsetY;
                const x0 = Math.max(0, -(offsetX >> this.scale));
                const xn = Math.min(this._map.width, (-offsetX + screen.width) >> this.scale);
                const y0 = Math.max(0, -(offsetY >> this.scale));
                const yn = Math.min(this._map.height, (-offsetY + screen.height) >> this.scale);
                for (let x = x0; x <= xn; ++x) {
                    screen.drawLine(
                        (x << this.scale) + offsetX,
                        offsetY,
                        (x << this.scale) + offsetX,
                        (this._map.height << this.scale) + offsetY,
                        1
                    );
                }
                for (let y = y0; y <= yn; ++y) {
                    screen.drawLine(
                        offsetX,
                        (y << this.scale) + offsetY,
                        (this._map.width << this.scale) + offsetX,
                        (y << this.scale) + offsetY,
                        1
                    );
                }
            }
        }

        public update(camera: scene.Camera) {
        }

        public collisions(s: Sprite): sprites.Obstacle[] {
            let overlappers: sprites.StaticObstacle[] = [];

            if (this.enabled && (s.layer & this.layer) && !(s.flags & sprites.Flag.Ghost)) {
                const x0 = Math.max(0, s.left >> this.scale);
                const xn = Math.min(this._map.width, (s.right >> this.scale) + 1);
                const y0 = Math.max(0, s.top >> this.scale);
                const yn = Math.min(this._map.height, (s.bottom >> this.scale) + 1);

                // let res = `x: ${x0}-${xn} y: ${y0}-${yn} HIT:`;
                for (let x = x0; x <= xn; ++x) {
                    const left = x << this.scale;
                    for (let y = y0; y <= yn; ++y) {
                        const index = this._map.getPixel(x, y);
                        const tile = this._tileSets[index] || this.generateTile(index);
                        if (tile && tile.obstacle) {
                            const top = y << this.scale;
                            if (tile.image.overlapsWith(s.image, s.left - left, s.top - top)) {
                                overlappers.push(new sprites.StaticObstacle(tile.image, top, left, this.layer, index));
                            }
                        }
                    }
                }
            }

            return overlappers;
        }

        public isObstacle(col: number, row: number) {
            if (!this.enabled) return false;
            if (this.isOutsideMap(col, row)) return true;

            let t = this._tileSets[this._map.getPixel(col, row)];
            return t && t.obstacle;
        }

        public getObstacle(col: number, row: number) {
            const index = this.isOutsideMap(col, row) ? this._map.getPixel(col, row) : 0;
            const tile = this._tileSets[index] || this.generateTile(index);
            return new sprites.StaticObstacle(tile.image, row << this.scale, col << this.scale, this.layer, index);
        }
    }
}
