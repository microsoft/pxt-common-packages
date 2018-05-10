namespace tiles {
    class Tile {
        image: Image;
        obstacle: boolean;
        constructor(image: Image, collisions: boolean) {
            this.image = image;
            this.obstacle = collisions;
        }
    }

    class TileSprite {
        x: number;
        y: number;
        tileIndex: number;
        sprite: sprites.Obstacle;
        constructor(x: number, y: number, tileIndex: number, sprite: sprites.Obstacle) {
            this.x = x;
            this.y = y;
            this.tileIndex = tileIndex;
            this.sprite = sprite;
        }
    }

    interface Chunk {
        column: number;
        row: number;
        loaded: boolean;
        shouldBeLoaded: boolean;
    }

    let workerLoaded = false;

    export class TileMap implements SpriteLike {
        camera: scene.Camera;
        tileWidth: number;
        tileHeight: number;

        chunkColumns: number;
        chunkRows: number;
        chunkWidth: number;
        chunkHeight: number;

        needsUpdate: boolean;

        id: number;
        z: number;
        obstacleMap: sprites.ObstacleMap;

        private _layer: number;

        private _map: Image;
        private _tiles: Tile[];
        private _tileSprites: TileSprite[];
        private _chunks: Chunk[];

        constructor(camera: scene.Camera, tileWidth: number, tileHeight: number) {
            this.camera = camera;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this._map = img`1`;
            this._tiles = [];
            this._tileSprites = [];
            this._layer = 1;

            this.z = -1;
            this.id = game.currentScene().allSprites.length;

            const scene = game.currentScene();
            scene.allSprites.push(this);
            this.id = scene.allSprites.length;

            this.obstacleMap = new sprites.ObstacleMap();

            this.destroy();
        }

        offsetX(value: number) {
            return Math.max(0, Math.min(this._map.width * this.tileWidth - screen.width, value));
        }

        offsetY(value: number) {
            return Math.max(0, Math.min(this._map.height * this.tileHeight - screen.height, value));
        }

        get layer(): number {
            return this._layer;
        }

        set layer(value: number) {
            if (this._layer != value) {
                this._layer = value;
                this._tileSprites.forEach(sp => sp.sprite.layer = this._layer);
                this.needsUpdate = true;
            }
        }

        setTile(index: number, img: Image, collisions?: boolean) {
            if (index < 0 || index > 0xf) return;
            this._tiles[index] = new Tile(img, collisions);
            this.needsUpdate = true;
        }

        setMap(map: Image) {
            this._map = map;
            this.destroy();
        }

        __update(camera: scene.Camera, dt: number): void { }

        /**
         * This draws all non-obstacle tiles so that we can reduce the number of
         * sprites created
         */
        __draw(camera: scene.Camera): void {
            const offsetX = camera.offsetX % this.tileWidth;
            const offsetY = camera.offsetY % this.tileHeight;
            const x0 = Math.max(0, Math.floor(camera.offsetX/ this.tileWidth));
            const xn = Math.min(this._map.width, Math.ceil((camera.offsetX + screen.width) / this.tileWidth));
            const y0 = Math.max(0, Math.floor(camera.offsetY / this.tileHeight));
            const yn = Math.min(this._map.height, Math.ceil((camera.offsetY + screen.height) / this.tileHeight));

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tiles[index] || this.generateTile(index);
                    if (tile && !tile.obstacle) {
                        screen.drawImage(tile.image, (x - x0) * this.tileWidth - offsetX, (y - y0) * this.tileHeight - offsetY)
                    }
                }
            }
        }

        private generateTile(index: number): Tile {
            if (index == 0) return undefined;

            const img = image.create(this.tileWidth, this.tileHeight);
            img.fill(index);
            return this._tiles[index] = new Tile(img, false);
        }

        render(camera: scene.Camera) {
            if (!this._map) return;
            if (game.debug) {
                const offsetX = -camera.offsetX;
                const offsetY = -camera.offsetY;
                const x0 = Math.max(0, Math.floor(-offsetX / this.tileWidth));
                const xn = Math.min(this._map.width, Math.ceil((-offsetX + screen.width) / this.tileWidth));
                const y0 = Math.max(0, Math.floor(-offsetY / this.tileHeight));
                const yn = Math.min(this._map.height, Math.ceil((-offsetY + screen.height) / this.tileHeight));
                for (let x = x0; x <= xn; ++x) {
                    screen.drawLine(
                        x * this.tileWidth + offsetX,
                        offsetY,
                        x * this.tileWidth + offsetX,
                        this._map.height * this.tileHeight + offsetY, 1)
                }
                for (let y = y0; y <= yn; ++y) {
                    screen.drawLine(
                        offsetX,
                        y * this.tileHeight + offsetY,
                        this.tileWidth * this._map.width + offsetX,
                        y * this.tileHeight + offsetY,
                        1)
                }
            }
        }

        public update(camera: scene.Camera) {
            if (!this._map || !this.needsUpdate) return;
            this.needsUpdate = false;

            const sLeft = camera.offsetX;
            const sTop = camera.offsetY;
            const sRight = sLeft + screen.width;
            const sBottom = sTop + screen.height;

            this._chunks.forEach(chunk => {
                if (chunk.loaded) {
                    chunk.shouldBeLoaded = this.overlaps(chunk, sLeft, sRight, sTop, sBottom, screen.width * 2);
                }
                else {
                    chunk.shouldBeLoaded = this.overlaps(chunk, sLeft, sRight, sTop, sBottom, screen.width * 2 - 50);
                }
            });
        }

        private overlaps(chunk: Chunk, l: number, r: number, t: number, b: number, radius: number) {
            const left = chunk.column * this.chunkWidth - radius;
            const right = left + this.chunkWidth + (radius << 1);
            const top = chunk.row * this.chunkHeight - radius;
            const bottom = top + this.chunkHeight + (radius << 1);

            return !(right < l || bottom < t || left > r || top > b);
        }

        private loadChunk(chunk: Chunk) {
            if (chunk.loaded) return;
            chunk.loaded = true;

            console.log(`LOAD: c=${chunk.column} r=${chunk.row}`)

            const x0 = chunk.column * this.chunkColumns;
            const xn = Math.min(x0 + this.chunkColumns, this._map.width);

            const y0 = chunk.row * this.chunkRows;
            const yn = Math.min(y0 + this.chunkRows, this._map.height);

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tiles[index] || this.generateTile(index);
                    if (tile && tile.obstacle && !this._tileSprites.some(ts => ts.x == x && ts.y == y)) {
                        const tileSprite = new TileSprite(x, y, index, sprites.createObstacle2(tile.image));
                        tileSprite.sprite.x = tileSprite.x * this.tileWidth + this.tileWidth / 2;
                        tileSprite.sprite.y = tileSprite.y * this.tileHeight + this.tileHeight / 2;
                        tileSprite.sprite.layer = this._layer;
                        tileSprite.sprite.z = -1;
                        this._tileSprites.push(tileSprite);
                    }
                }
                pause(1);
            }
            this.updateCollisionMap();
        }

        private unloadChunk(chunk: Chunk) {
            if (!chunk.loaded) return;
            chunk.loaded = false;

            console.log(`UNLOAD: c=${chunk.column} r=${chunk.row}`)

            const minX = chunk.column * this.chunkWidth;
            const maxX = minX + this.chunkWidth;

            const minY = chunk.row * this.chunkHeight;
            const maxY = minY + this.chunkHeight;

            this._tileSprites = this._tileSprites.filter(ts => {
                if (ts.sprite.x < minX || ts.sprite.x > maxX || ts.sprite.y < minY || ts.sprite.y > maxY) {
                    ts.sprite.destroy();
                    return false;
                }
                return true;
            });
            this.updateCollisionMap();
        }

        private updateCollisionMap() {
            const obstacles: sprites.Obstacle[] = [];
            this._tileSprites.forEach(t => obstacles.push(t.sprite));
            this.obstacleMap.update(obstacles);
        }

        private initChunks() {
            this._chunks = [];

            if (!workerLoaded) {
                workerLoaded = true;
                control.runInParallel(() => {
                    while (true) {
                        this._chunks.forEach(c => {
                            if (c.shouldBeLoaded != c.loaded) {
                                if (c.loaded) {
                                    this.unloadChunk(c);
                                }
                                else {
                                    this.loadChunk(c);
                                }
                            }
                        })
                        pause(500);
                    }
                })
            }

            // The width/height of a chunk in tiles
            this.chunkColumns = Math.ceil((screen.width << 1) / this.tileWidth);
            this.chunkRows = Math.ceil((screen.height << 1) / this.tileHeight);

            // The width/height of a chunk in pixels
            this.chunkWidth = this.chunkColumns * this.tileWidth;
            this.chunkHeight = this.chunkRows * this.tileHeight;

            // The width/height of the tilemap in pixels
            const mapWidth = this._map.width * this.tileWidth;
            const mapHeight = this._map.height * this.tileHeight;

            // The number of chunks to create for the map
            const columns = Math.ceil(mapWidth / (this.chunkColumns * this.tileWidth));
            const rows = Math.ceil(mapHeight / (this.chunkRows * this.tileHeight));

            for (let x = 0; x < columns; x ++) {
                for (let y = 0; y < rows; y ++) {
                    this._chunks.push({
                        column: x,
                        row: y,
                        loaded: false,
                        shouldBeLoaded: false
                    });
                }
            }
        }

        private destroy() {
            // delete previous sprites
            this._tileSprites.forEach(sp => sp.sprite.destroy());
            this._tileSprites = [];
            this.initChunks();
            this.needsUpdate = true;
        }
    }
}