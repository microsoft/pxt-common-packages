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
        tileWidth: number;
        tileHeight: number;
    
        private _needsUpdate: boolean;
        private _offsetX: number;
        private _offsetY: number;
        private _layer: number;
    
        private _map: Image;
        private _tiles: Tile[];
        private _tileSprites: TileSprite[];
    
        constructor(tileWidth: number, tileHeight: number) {
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this._map = img`1`;
            this._tiles = [];
            this._tileSprites = [];
            this._offsetX = 0;
            this._offsetY = 0;
            this._layer = 1;
            this.destroy();
        }
    
        get offsetX() {
            return this._offsetX;
        }
    
        set offsetX(value: number) {
            value = Math.min(0, Math.max(screen.width - this._map.width * this.tileWidth, value));
            if (value != this._offsetX) {
                this._offsetX = value;
                this._needsUpdate = true;
            }
        }
    
        get offsetY() {
            return this._offsetY;
        }
    
        set offsetY(value: number) {
            value = Math.min(0, Math.max(screen.height - this._map.height * this.tileHeight, value));
            if (value != this._offsetY) {
                this._offsetY = value;
                this._needsUpdate = true;
            }
        }
    
        get layer(): number {
            return this._layer;
        }
    
        set layer(value: number) {
            this._layer = value;
            this._tileSprites.forEach(sp => sp.sprite.layer = this._layer);
        }
    
        setTile(index: number, img: Image, collisions: boolean) {
            if (index < 0 || index > 0xf) return;
            this._tiles[index] = new Tile(img, collisions);
            this._needsUpdate;
        }
    
        setMap(map: Image) {
            this._map = map;
            this.destroy();
        }
    
        render() {
            if (!this._map) return;
            if (game.debug) {
                const x0 = Math.max(0, Math.floor(-this._offsetX / this.tileWidth));
                const xn = Math.min(this._map.width, Math.ceil((-this._offsetX + screen.width) / this.tileWidth));
                const y0 = Math.max(0, Math.floor(-this._offsetY / this.tileHeight));
                const yn = Math.min(this._map.height, Math.ceil((-this._offsetY + screen.height) / this.tileHeight));
                for (let x = x0; x <= xn; ++x) {
                    screen.drawLine(x * this.tileWidth + this.offsetX, this.offsetY, x * this.tileWidth + this.offsetX, this._map.height * this.tileHeight + this.offsetY, 1)
                }
                for (let y = y0; y <= yn; ++y) {
                    screen.drawLine(this.offsetX, y * this.tileHeight + this.offsetY, this.tileWidth * this._map.width + this.offsetX, y * this.tileHeight + this.offsetY, 1)
                }
            }
        }
    
        public update() {
            if (!this._map || !this._needsUpdate) return;
    
            this._needsUpdate = false;
    
            // remove outofbounds sprites
            this._tileSprites = this._tileSprites.filter(ts => {
                if(ts.sprite.isOutOfScreen()) {
                    ts.sprite.destroy();
                    return false;
                }
                else return true;
            });
    
            // compute visible area
            const x0 = Math.max(0, Math.floor(-this._offsetX / this.tileWidth));
            const xn = Math.min(this._map.width, Math.ceil((-this._offsetX + screen.width) / this.tileWidth));
            const y0 = Math.max(0, Math.floor(-this._offsetY / this.tileHeight));
            const yn = Math.min(this._map.height, Math.ceil((-this._offsetY + screen.height) / this.tileHeight));
    
            // add missing sprites
            for (let x = x0; x < xn; ++x) {
                for (let y = y0; y < yn; ++y) {
                    const index = this._map.getPixel(x, y);
                    const tile = this._tiles[index];
                    if (tile && !this._tileSprites.some(ts => ts.x == x && ts.y == y)) {
                        const tileSprite = new TileSprite(x, y, index, sprites.create(tile.image));
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
    
            // update sprite positions
            for (const tileSprite of this._tileSprites) {
                tileSprite.sprite.x = tileSprite.x * this.tileWidth + this.tileWidth / 2 + this._offsetX;
                tileSprite.sprite.y = tileSprite.y * this.tileHeight + this.tileHeight / 2 + this._offsetY;
            }
        }
    
        private destroy() {
            // delete previous sprites
            this._tileSprites.forEach(sp => sp.sprite.destroy());
            this._tileSprites = [];
            this._needsUpdate = true;
        }
    }        
}