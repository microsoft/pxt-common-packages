namespace tiles {
    class Tile {
        image: Image;
        obstacle: boolean;
        constructor(image: Image, collisions: boolean) {
            this.image = image;
            this.obstacle = collisions;
        }
    }

    export class TileMap implements SpriteLike {
        camera: scene.Camera;
        tileWidth: number;
        tileHeight: number;

        id: number;
        z: number;

        private _layer: number;

        private _map: Image;
        private _tiles: Tile[];

        constructor(camera: scene.Camera, tileWidth: number, tileHeight: number) {
            this.camera = camera;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;

            this._map = img`1`;
            this._tiles = [];
            this._layer = 1;

            this.z = -1;

            const sc = game.currentScene();
            sc.allSprites.push(this);
            sc.flags |= scene.Flag.NeedsSorting;
            this.id = sc.allSprites.length;
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
            }
        }

        setTile(index: number, img: Image, collisions?: boolean) {
            if (index < 0 || index > 0xf) return;
            this._tiles[index] = new Tile(img, collisions);
        }

        setMap(map: Image) {
            this._map = map;
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
                    if (tile) {
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
        }

        public collisions(s: Sprite): sprites.Obstacle[] {
            let overlappers: sprites.StaticObstacle[] = [];

            if (s.layer & this.layer) {
                let x0: number;
                let xn: number;
                let y0: number;
                let yn: number;

                if (this.tileWidth === this.tileHeight && this.tileHeight === 16) {
                    x0 = Math.max(0, s.left >> 4);
                    xn = Math.min(this._map.width, (s.right >> 4) + 1);
                    y0 = Math.max(0, s.top >> 4);
                    yn = Math.min(this._map.height, (s.bottom >> 4) + 1);
                }
                else {
                    x0 = Math.max(0, Math.floor(s.left / this.tileWidth));
                    xn = Math.min(this._map.width, Math.ceil(s.right / this.tileWidth));
                    y0 = Math.max(0, Math.floor(s.top / this.tileHeight));
                    yn = Math.min(this._map.height, Math.ceil(s.bottom / this.tileHeight));
                }

                // let res = `x: ${x0}-${xn} y: ${y0}-${yn} HIT:`;
                for (let x = x0; x <= xn; ++x) {
                    const left = x * this.tileWidth;
                    for (let y = y0; y <= yn; ++y) {
                        const index = this._map.getPixel(x, y);
                        const tile = this._tiles[index] || this.generateTile(index);
                        if (tile && tile.obstacle) {
                            const top = y * this.tileHeight;
                            if (tile.image.overlapsWith(s.image, s.left - left, s.top - top)) {
                                overlappers.push(new sprites.StaticObstacle(tile.image, top, left, this.layer, index));
                            }
                        }
                    }
                }
            }

            return overlappers;
        }
    }
}