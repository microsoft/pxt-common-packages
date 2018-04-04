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
        sprite: Sprite;
        constructor(x: number, y: number, tileIndex: number, sprite: Sprite) {
            this.x = x;
            this.y = y;
            this.tileIndex = tileIndex;
            this.sprite = sprite;
        }
    }

    export class TileMap {
        camera: game.Camera;
        tileWidth: number;
        tileHeight: number;

        needsUpdate: boolean;
        private _layer: number;

        private _map: Image;
        private _tiles: Tile[];
        private _tileSprites: TileSprite[];

        constructor(camera: game.Camera, tileWidth: number, tileHeight: number) {
            this.camera = camera;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this._map = img`1`;
            this._tiles = [];
            this._tileSprites = [];
            this._layer = 1;
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

        private generateTile(index: number): Tile {
            if (index == 0) return undefined;

            const img = image.create(this.tileWidth, this.tileHeight);
            img.fill(index);
            const border = [0, 0xf, 3, 2, 3, 4, 7, 8, 7, 0xb, 0xd, 9, 9, 9, 0xd, 1][index];
            // border
            img.drawLine(0, 0, img.width - 1, 0, border);
            img.drawLine(0, img.height - 1, img.width - 1, img.height - 1, border);
            img.drawLine(0, img.height - 1, img.width - 1, img.height - 1, border);
            img.drawLine(img.width - 1, 0, img.width - 1, img.height - 1, border);
            img.drawLine(0, 0, 0, img.height - 1, border);
            return this._tiles[index] = new Tile(img, false);
        }

        render(camera: game.Camera) {
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

        public update(camera: game.Camera) {
            if (!this._map || !this.needsUpdate) return;

            this.needsUpdate = false;

            // remove outofbounds sprites
            this._tileSprites = this._tileSprites.filter(ts => {
                if (ts.sprite.isOutOfScreen(this.camera)) {
                    ts.sprite.destroy();
                    return false;
                }
                else return true;
            });

            // compute visible area
            const offsetX = -camera.offsetX;
            const offsetY = -camera.offsetY;
            const x0 = Math.max(0, Math.floor(-offsetX / this.tileWidth));
            const xn = Math.min(this._map.width, Math.ceil((-offsetX + screen.width) / this.tileWidth));
            const y0 = Math.max(0, Math.floor(-offsetY / this.tileHeight));
            const yn = Math.min(this._map.height, Math.ceil((-offsetY + screen.height) / this.tileHeight));

            // add missing sprites
            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tiles[index] || this.generateTile(index);
                    if (tile && !this._tileSprites.some(ts => ts.x == x && ts.y == y)) {
                        const tileSprite = new TileSprite(x, y, index, sprites.create(tile.image));
                        tileSprite.sprite.x = tileSprite.x * this.tileWidth + this.tileWidth / 2;
                        tileSprite.sprite.y = tileSprite.y * this.tileHeight + this.tileHeight / 2;
                        tileSprite.sprite.layer = this._layer;
                        tileSprite.sprite.z = -1;
                        if (!tile.obstacle)
                            tileSprite.sprite.setFlag(SpriteFlag.Ghost, true)
                        else
                            tileSprite.sprite.setFlag(SpriteFlag.Obstacle, true);
                        this._tileSprites.push(tileSprite);
                    }
                }
            }
        }

        private destroy() {
            // delete previous sprites
            this._tileSprites.forEach(sp => sp.sprite.destroy());
            this._tileSprites = [];
            this.needsUpdate = true;
        }
    }
}