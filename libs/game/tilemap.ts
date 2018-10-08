namespace tiles {
    class TileSet {
        image: Image;
        obstacle: boolean;
        constructor(image: Image, collisions: boolean) {
            this.image = image;
            this.obstacle = collisions;
        }
    }

    /**
     * A tile in the tilemap
     **/
    //% blockNamespace=scene color="#401255" blockGap=8
    export class Tile {
        private _row: number;
        private _col: number;
        private _map: Image;

        constructor(col: number, row: number, map: Image) {
            this._col = col;
            this._row = row;
            this._map = map;
        }

        get x(): number {
            return this._col << 4;
        }

        get y(): number {
            return this._row << 4;
        }

        get tileSet(): number {
            return this._map.getPixel(this._col, this._row);
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

            mySprite.x = this.x + 8;
            mySprite.y = this.y + 8;
        }
    }

    export class TileMap implements SpriteLike {
        id: number;
        z: number;

        private _layer: number;

        private _map: Image;
        private _tileSets: TileSet[];

        constructor() {
            this._map = img`1`;
            this._tileSets = [];
            this._layer = 1;

            this.z = -1;

            const sc = game.currentScene();
            sc.allSprites.push(this);
            sc.flags |= scene.Flag.NeedsSorting;
            this.id = sc.allSprites.length;
        }

        offsetX(value: number) {
            return Math.clamp(0, (this._map.width << 4) - screen.width, value);
        }

        offsetY(value: number) {
            return Math.clamp(0, (this._map.height << 4) - screen.height, value);
        }

        areaWidth() {
            return this._map ? (this._map.width << 4) : 0;
        }

        areaHeight() {
            return this._map ? (this._map.height << 4) : 0;
        }

        get layer(): number {
            return this._layer;
        }

        set layer(value: number) {
            if (this._layer != value) {
                this._layer = value;
            }
        }

        setTile(index: number, img: Image, collisions?: boolean) {
            if (this.isInvalidIndex(index)) return;
            this._tileSets[index] = new TileSet(img, collisions);
        }

        setMap(map: Image) {
            this._map = map;
        }

        public getTile(col: number, row: number): Tile {
            if (this.isOutsideMap(col, row)) return undefined;
            return new Tile(col, row, this._map);
        }

        public setTileAt(col: number, row: number, index: number): void {
            if (!this.isOutsideMap(col, row) && !this.isInvalidIndex(index))
                this._map.setPixel(col, row, index);
        }

        public getTilesByType(index: number): Tile[] {
            if (this.isInvalidIndex(index)) return undefined;

            let output: Tile[] = [];
            for (let col = 0; col < this._map.width; ++col) {
                for (let row = 0; row < this._map.height; ++row) {
                    let currTile = this._map.getPixel(col, row);
                    if (currTile === index) {
                        output.push(new Tile(col, row, this._map));
                    }
                }
            }
            return output;
        }

        __update(camera: scene.Camera, dt: number): void { }

        /**
         * Draws all visible
         */
        __draw(camera: scene.Camera): void {
            const offsetX = camera.offsetX & 0xf;
            const offsetY = camera.offsetY & 0xf;
            const x0 = Math.max(0, camera.offsetX >> 4);
            const xn = Math.min(this._map.width, ((camera.offsetX + screen.width) >> 4) + 1);
            const y0 = Math.max(0, camera.offsetY >> 4);
            const yn = Math.min(this._map.height, ((camera.offsetY + screen.height) >> 4) + 1);

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tileSets[index] || this.generateTile(index);
                    if (tile) {
                        screen.drawTransparentImage(tile.image, ((x - x0) << 4) - offsetX, ((y - y0) << 4) - offsetY)
                    }
                }
            }
        }

        private generateTile(index: number): TileSet {
            if (index == 0) return undefined;

            const img = image.create(16, 16);
            img.fill(index);
            return this._tileSets[index] = new TileSet(img, false);
        }

        private isOutsideMap(col: number, row: number): boolean {
            return col < 0 || col >= this._map.width
                    || row < 0 || row >= this._map.height;
        }

        private isInvalidIndex(index: number): boolean {
            return index < 0 || index > 0xf;
        }

        render(camera: scene.Camera) {
            if (!this._map) return;
            if (game.debug) {
                const offsetX = -camera.offsetX;
                const offsetY = -camera.offsetY;
                const x0 = Math.max(0, -(offsetX >> 4));
                const xn = Math.min(this._map.width, (-offsetX + screen.width) >> 4);
                const y0 = Math.max(0, -(offsetY >> 4));
                const yn = Math.min(this._map.height, (-offsetY + screen.height) >> 4);
                for (let x = x0; x <= xn; ++x) {
                    screen.drawLine(
                        (x << 4) + offsetX,
                        offsetY,
                        (x << 4) + offsetX,
                        (this._map.height << 4) + offsetY, 1)
                }
                for (let y = y0; y <= yn; ++y) {
                    screen.drawLine(
                        offsetX,
                        (y  << 4) + offsetY,
                        (this._map.width << 4) + offsetX,
                        (y << 4) + offsetY,
                        1)
                }
            }
        }

        public update(camera: scene.Camera) {
        }

        public collisions(s: Sprite): sprites.Obstacle[] {
            let overlappers: sprites.StaticObstacle[] = [];

            if ((s.layer & this.layer) && !(s.flags & sprites.Flag.Ghost)) {
                const x0 = Math.max(0, s.left >> 4);
                const xn = Math.min(this._map.width, (s.right >> 4) + 1);
                const y0 = Math.max(0, s.top >> 4);
                const yn = Math.min(this._map.height, (s.bottom >> 4) + 1);

                // let res = `x: ${x0}-${xn} y: ${y0}-${yn} HIT:`;
                for (let x = x0; x <= xn; ++x) {
                    const left = x << 4;
                    for (let y = y0; y <= yn; ++y) {
                        const index = this._map.getPixel(x, y);
                        const tile = this._tileSets[index] || this.generateTile(index);
                        if (tile && tile.obstacle) {
                            const top = y << 4;
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
            if (!this._map) return false;
            if (this.isOutsideMap(col, row)) return true;

            return this._tileSets[this._map.getPixel(col, row)].obstacle;
        }

        public getObstacle(col: number, row: number) {
            if (!this._map) return undefined;
            if (this.isOutsideMap(col, row)) return undefined;

            const index = this._map.getPixel(col, row);
            const tile = this._tileSets[index] || this.generateTile(index);
            if (tile.obstacle) {
                return new sprites.StaticObstacle(tile.image, row << 4, col << 4, this.layer, index);
            }
            return undefined;
        }
    }
}